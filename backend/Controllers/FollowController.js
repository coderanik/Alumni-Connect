const Alumni = require("../Models/alumni");
const User = require("../Models/users");

const followUser = async (req, res) => {
    const { userId, followeeId } = req.params;
    console.log('followUser called with params:', { userId, followeeId });
  
    try {
      // Check if both users exist
      const [user, followee] = await Promise.all([
        Promise.all([
          User.findById(userId),
          Alumni.findById(userId)
        ]).then(([user, alumniUser]) => user || alumniUser),
        User.findById(followeeId)
      ]);

      console.log('Found users:', { user: !!user, followee: !!followee });

      if (!user || !followee) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already following
      if (user.followingStudents && user.followingStudents.includes(followeeId)) {
        return res.status(400).json({ error: 'Already following this user' });
      }

      // Add the followeeId to the User's followingStudents array
      if (user instanceof User) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { followingStudents: followeeId }
        });
      } else {
        await Alumni.findByIdAndUpdate(userId, {
          $addToSet: { followingStudents: followeeId }
        });
      }
  
      // Add the UserId to the followee's followers array
      await User.findByIdAndUpdate(followeeId, {
        $addToSet: { followers: userId }
      });
  
      res.status(200).json({ message: 'Successfully followed the user' });
    } catch (error) {
      console.error('Error in followUser:', error);
      res.status(500).json({ error: 'Failed to follow the user' });
    }
};

const followAlumni = async (req, res) => {
    const { userId, alumniId } = req.params;
    console.log('followAlumni called with params:', { userId, alumniId });
  
    try {
      // Check if both user and alumni exist
      const [user, alumni] = await Promise.all([
        Promise.all([
          User.findById(userId),
          Alumni.findById(userId)
        ]).then(([user, alumniUser]) => user || alumniUser),
        Alumni.findById(alumniId)
      ]);

      console.log('Found user and alumni:', { user: !!user, alumni: !!alumni });

      if (!user || !alumni) {
        return res.status(404).json({ error: 'User or alumni not found' });
      }

      // Check if already following
      if (user.followingAlumni && user.followingAlumni.includes(alumniId)) {
        return res.status(400).json({ error: 'Already following this alumni' });
      }

      // Add the alumniId to the User's followingAlumni array
      if (user instanceof User) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { followingAlumni: alumniId }
        });
      } else {
        await Alumni.findByIdAndUpdate(userId, {
          $addToSet: { followingAlumni: alumniId }
        });
      }
  
      // Add the UserId to the alumni's followers array
      await Alumni.findByIdAndUpdate(alumniId, {
        $addToSet: { followers: userId }
      });
  
      res.status(200).json({ message: 'Successfully followed the alumni' });
    } catch (error) {
      console.error('Error in followAlumni:', error);
      res.status(500).json({ error: 'Failed to follow the alumni' });
    }
};

const unfollowUser = async (req, res) => {
    const { userId, followeeId } = req.params;
    console.log('unfollowUser called with params:', { userId, followeeId });
  
    try {
      // Check if both users exist
      const [user, followee] = await Promise.all([
        Promise.all([
          User.findById(userId),
          Alumni.findById(userId)
        ]).then(([user, alumniUser]) => user || alumniUser),
        User.findById(followeeId)
      ]);

      console.log('Found users:', { user: !!user, followee: !!followee });

      if (!user || !followee) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if actually following
      if (!user.followingStudents || !user.followingStudents.includes(followeeId)) {
        return res.status(400).json({ error: 'Not following this user' });
      }

      // Remove the followeeId from the User's followingStudents array
      if (user instanceof User) {
        await User.findByIdAndUpdate(userId, {
          $pull: { followingStudents: followeeId }
        });
      } else {
        await Alumni.findByIdAndUpdate(userId, {
          $pull: { followingStudents: followeeId }
        });
      }
  
      // Remove the UserId from the followee's followers array
      await User.findByIdAndUpdate(followeeId, {
        $pull: { followers: userId }
      });
  
      res.status(200).json({ message: 'Successfully unfollowed the user' });
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      res.status(500).json({ error: 'Failed to unfollow the user' });
    }
};

const unfollowAlumni = async (req, res) => {
    const { userId, alumniId } = req.params;
    console.log('unfollowAlumni called with params:', { userId, alumniId });
  
    try {
      // Check if both user and alumni exist
      const [user, alumni] = await Promise.all([
        Promise.all([
          User.findById(userId),
          Alumni.findById(userId)
        ]).then(([user, alumniUser]) => user || alumniUser),
        Alumni.findById(alumniId)
      ]);

      console.log('Found user and alumni:', { user: !!user, alumni: !!alumni });

      if (!user || !alumni) {
        return res.status(404).json({ error: 'User or alumni not found' });
      }

      // Check if actually following
      if (!user.followingAlumni || !user.followingAlumni.includes(alumniId)) {
        return res.status(400).json({ error: 'Not following this alumni' });
      }

      // Remove the alumniId from the User's followingAlumni array
      if (user instanceof User) {
        await User.findByIdAndUpdate(userId, {
          $pull: { followingAlumni: alumniId }
        });
      } else {
        await Alumni.findByIdAndUpdate(userId, {
          $pull: { followingAlumni: alumniId }
        });
      }
  
      // Remove the UserId from the alumni's followers array
      await Alumni.findByIdAndUpdate(alumniId, {
        $pull: { followers: userId }
      });
  
      res.status(200).json({ message: 'Successfully unfollowed the alumni' });
    } catch (error) {
      console.error('Error in unfollowAlumni:', error);
      res.status(500).json({ error: 'Failed to unfollow the alumni' });
    }
};

module.exports = { followUser, followAlumni, unfollowUser, unfollowAlumni };