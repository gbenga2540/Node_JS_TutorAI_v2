const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: false,
    },
    password: {
        type: String,
        required: true,
    },
    privilege: {
        type: String,
        enum: ['Level 1', 'Level 2', 'Level 3', 'Super Admin'],
        default: 'Level 1',
    },
    dp: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    status: {
        type: Boolean,
        default: true,
    },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
