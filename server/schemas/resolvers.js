// import models & auth function
const { User } = require('../models');
const { signToken } = require('../utils/auth');

// initiate resolvers
const resolvers = {
  Query: {
    // TODO
    // find by username OR ID
    me: async () => {
      return User.findOne({ _id: context.context.user._id }).populate('savedBooks');
    },
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    // TODO
    // find by username OR email
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { book }, context) => {
      if (context.user) {

        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } }
        );

        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: bookId}}
        );

        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  }
};

// export resolvers
module.exports = resolvers;