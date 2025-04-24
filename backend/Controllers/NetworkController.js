// controllers/networkController.js

const User = require('../Models/users');
const Alumni = require('../Models/alumni'); // Alumni model

const getNetworkData = async (req, res) => {
  try {
    const students = await User.find().select('fullName graduationYear fieldOfStudy linkedin');
    const alumni = await Alumni.find().select('fullName graduationYear linkedin role');

    const formattedStudents = students.map(s => ({
      name: s.fullName,
      graduationYear: s.graduationYear,
      field: s.fieldOfStudy,
      linkedin: s.linkedin
    }));

    const formattedAlumni = alumni.map(a => ({
      name: a.fullName,
      graduationYear: a.graduationYear,
      field: 'N/A', // Assuming Alumni doesn't have `fieldOfStudy`
      position: a.role, // Replace with actual job if stored separately
      linkedin: a.linkedin
    }));

    res.json({
      students: formattedStudents,
      alumni: formattedAlumni
    });
  } catch (error) {
    console.error('Error fetching network data:', error);
    res.status(500).json({ error: 'Failed to retrieve network data' });
  }
};

module.exports = { getNetworkData };
