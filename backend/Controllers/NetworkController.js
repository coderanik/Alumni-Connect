// controllers/networkController.js

const User = require('../Models/users');
const Alumni = require('../Models/alumni'); // Alumni model

const getNetworkData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get students with followers
    const students = await User.find()
      .select('_id fullName graduationYear fieldOfStudy linkedin followers')
      .populate({
        path: 'followers',
        select: '_id',
        options: { lean: true }
      })
      .lean();

    // Get alumni with followers
    const alumni = await Alumni.find()
      .select('_id fullName graduationYear linkedin role followers')
      .populate({
        path: 'followers',
        select: '_id',
        options: { lean: true }
      })
      .lean();

    const formattedStudents = students.map(s => ({
      _id: s._id,
      name: s.fullName,
      graduationYear: s.graduationYear,
      field: s.fieldOfStudy,
      linkedin: s.linkedin,
      followers: (s.followers || []).map(f => f._id)
    }));

    const formattedAlumni = alumni.map(a => ({
      _id: a._id,
      name: a.fullName,
      graduationYear: a.graduationYear,
      field: 'N/A', // Assuming Alumni doesn't have `fieldOfStudy`
      position: a.role, // Replace with actual job if stored separately
      linkedin: a.linkedin,
      followers: (a.followers || []).map(f => f._id)
    }));

    res.json({
      students: formattedStudents,
      alumni: formattedAlumni
    });
  } catch (error) {
    console.error('Error fetching network data:', error);
    res.status(500).json({ error: 'Failed to retrieve network data: ' + error.message });
  }
};

module.exports = { getNetworkData };
