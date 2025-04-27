import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ComplaintModel } from './models/complaint.js';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voice-of-streets')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Geocode location using Google Maps API
async function geocodeLocation(location) {
  if (!location) return { lat: 40.7128, lng: -74.0060 };
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    const response = await axios.get(url);
    if (
      response.data.status === 'OK' &&
      response.data.results &&
      response.data.results[0] &&
      response.data.results[0].geometry &&
      response.data.results[0].geometry.location
    ) {
      return response.data.results[0].geometry.location;
    }
  } catch (err) {
    console.error('Google Maps Geocoding error:', err);
  }
  return { lat: 40.7128, lng: -74.0060 };
}

// Gemini AI Extraction Function
async function extractComplaintFields(description) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const config = { responseMimeType: 'text/plain' };
  // Improved prompt with examples and explicit instructions
  const prompt = `Extract the following fields from the complaint description: title, location (as a place name or address), problem type (one of: road, water, electricity, sanitation, other), severity (low, medium, high, critical), and department. Always answer in JSON format.\n\nEXAMPLES:\nDescription: There is a pothole on Avinashi Road near KMCH Hospital, Coimbatore.\n{\"title\":\"Pothole on Avinashi Road\",\"location\":\"Avinashi Road near KMCH Hospital, Coimbatore\",\"type\":\"road\",\"severity\":\"medium\",\"department\":\"Road Maintenance\"}\nDescription: Water contamination near east coimbatore and bus stops for a week.\n{\"title\":\"Water contamination near east Coimbatore\",\"location\":\"East Coimbatore, bus stops\",\"type\":\"water\",\"severity\":\"high\",\"department\":\"Water Authority\"}\n\nDescription: ${description}`;
  const contents = [
    { role: 'user', parts: [{ text: prompt }] },
  ];
  let response;
  try {
    response = await ai.models.generateContent({ model: 'gemini-2.5-pro-exp-03-25', config, contents });
  } catch (err) {
    console.error('Gemini API error:', err);
    return { title: '', location: '', type: '', severity: '', department: '', coordinates: { lat: 40.7128, lng: -74.0060 }, error: 'Gemini API error', raw: err?.message || String(err) };
  }
  let text = '';
  if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0] && typeof response.candidates[0].content.parts[0].text === 'string') {
    text = response.candidates[0].content.parts[0].text;
  } else if (response && response.response && typeof response.response.text === 'string') {
    text = response.response.text;
  } else {
    console.error('Unexpected Gemini API response:', response);
    return { title: '', location: '', type: '', severity: '', department: '', coordinates: { lat: 40.7128, lng: -74.0060 }, error: 'Invalid Gemini response', raw: response };
  }
  let result = {};
  try {
    result = JSON.parse(text);
  } catch (e) {
    result = { title: '', location: '', type: '', severity: '', department: '', raw: text };
  }
  // Fallbacks if Gemini fails
  if (!result.location || result.location === 'Unknown') {
    // Enhanced location extraction: look for 'in', 'at', 'near', 'on', and capitalized place names
    let locMatch = description.match(/\b(?:in|at|near|on) ([^.,;]+)/i);
    if (!locMatch) {
      // Try to find a common city or area name (capitalized word(s))
      const capWords = description.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)+)/g);
      if (capWords && capWords.length > 0) {
        locMatch = [null, capWords[0]];
      }
    }
    if (locMatch && locMatch[1]) {
      result.location = locMatch[1].trim();
    }
  }
  if (!result.type || result.type === 'other') {
    // Simple keyword-based type extraction
    if (/water|contamination|drinking/i.test(description)) result.type = 'water';
    else if (/road|pothole|traffic|accident/i.test(description)) result.type = 'road';
    else if (/electricity|power|current|transformer|outage|light/i.test(description)) result.type = 'electricity';
    else if (/sanitation|garbage|waste|clean/i.test(description)) result.type = 'sanitation';
    else result.type = 'other';
  }
  // Fallbacks for other required fields
  result.title = result.title || description.slice(0, 50) + (description.length > 50 ? '...' : '');
  result.location = result.location || 'Unknown';
  result.type = result.type || 'other';
  result.severity = result.severity || 'medium';
  result.department = result.department || 'General';
  // Geocode the extracted location
  result.coordinates = await geocodeLocation(result.location);
  // Log the raw Gemini output for debugging
  console.log('Gemini raw output:', text);
  return result;
}

// Routes
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await ComplaintModel.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: 'Description required' });
    // Extract fields using Gemini AI
    const extracted = await extractComplaintFields(description);
    const complaint = new ComplaintModel({
      description,
      ...extracted
    });
    const savedComplaint = await complaint.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: '22cs008@drngpit.ac.in',
      subject: 'New Complaint Reported',
      text: `A new complaint has been submitted.\n\nDescription: ${savedComplaint.description}\nLocation: ${savedComplaint.location}\nType: ${savedComplaint.type}\nSeverity: ${savedComplaint.severity}\nDepartment: ${savedComplaint.department}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.json(savedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/complaints/stats', async (req, res) => {
  try {
    const [total, byType, bySeverity, byStatus] = await Promise.all([
      ComplaintModel.countDocuments(),
      ComplaintModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      ComplaintModel.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      ComplaintModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const formatAggregation = (agg) => {
      return agg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});
    };

    res.json({
      total,
      byType: formatAggregation(byType),
      bySeverity: formatAggregation(bySeverity),
      byStatus: formatAggregation(byStatus)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});