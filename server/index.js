import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ComplaintModel } from './models/complaint.js';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const complaint = new ComplaintModel(req.body);
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
      text: `A new complaint has been submitted.\n\nTitle: ${savedComplaint.title}\nDescription: ${savedComplaint.description}\nType: ${savedComplaint.type}\nSeverity: ${savedComplaint.severity}\nLocation: ${savedComplaint.location}\nDepartment: ${savedComplaint.department}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
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