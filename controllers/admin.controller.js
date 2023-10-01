const Admin = require('../models/admin.model');
const User = require('../models/user.model');
const Unsubscribe = require('../models/unsubscribe.model');
const Review = require('../models/review.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    ResourceNotFound,
    Unauthorized,
    Forbidden,
} = require('../errors/httpErrors');
const cloudinary = require('../config/cloudinary.config');
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;
const pagination_indexer = require('../utils/Pagination_Indexer');
const { application } = require('express');
const { LessonTopic } = require('../models/lesson_topics.model');
const { Pricing } = require('../models/pricing.model');

const create = async (req, res) => {
    try {
        const { name, email, mobile, password, privilege, dp } = req.body;

        const result = await cloudinary.uploader.upload(dp, {
            folder: 'profile_pics',
        });

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        const admin = new Admin({
            name,
            email,
            mobile,
            password: hash,
            privilege,
            dp: {
                public_id: result.public_id,
                url: result.secure_url,
            },
        });

        const savedAdmin = await admin.save();
        res.status(200).json(savedAdmin);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const login = async (req, res) => {
    try {
        let user;
        const { email: IncomingEmail, password: IncomingPassword } = req.body;
        user = await Admin.findOne({ email: IncomingEmail });
        if (!user) throw new ResourceNotFound('Invalid Email/Password!');
        const { password } = user;
        const compare = await bcrypt.compare(IncomingPassword, password);
        if (!compare)
            throw new ResourceNotFound({
                message: 'Invalid Email/Password',
            });
        const payload = {
            id: user._id,
        };
        if (!user.status) throw new Unauthorized('Account Disabled!');
        const accessToken = jwt.sign(payload, process.env.JWT_SEC);
        return res.status(200).json({ user, accessToken });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const adminInfo = await Admin.find();
        res.status(200).json({ adminInfo });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const toggleAdminStatus = async (req, res) => {
    try {
        const admin_id = req.body.admin_id;
        const admin_status = req.body.admin_status || false;

        if (!admin_id) throw new ResourceNotFound('Invalid Admin ID!');

        await Admin.findByIdAndUpdate(admin_id, {
            status: admin_status,
        });
        res.status(200).json({ message: 'Updated!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const deleteAdmins = async (req, res) => {
    const admins = req.body.admins;

    try {
        if (admins?.length <= 0) throw new Forbidden('Admin List Empty!');
        const objectIdsToDelete = admins.map(id => new ObjectId(id));
        await Admin.deleteMany({ _id: { $in: objectIdsToDelete } });

        res.status(200).json({ message: 'Admins deleted!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const getAllDashboardInfo = async (req, res) => {
    try {
        const noOfUsers = await User.countDocuments();
        const noOfSubscribers = await User.countDocuments({
            payment: { $gt: 0 },
        });
        const noOfAdmins = await Admin.countDocuments();
        const recentReviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            noOfUsers,
            noOfSubscribers,
            noOfAdmins,
            recentReviews,
        });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldP, newP } = req.body;

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(newP, salt);

        const admin = await Admin.findById(req.user.id);
        if (!admin) throw new ResourceNotFound('Admin does not exist');

        const compare = await bcrypt.compare(oldP, admin.password);
        if (!compare) throw new BadRequest('Old password does not match!');

        admin.password = hash;
        await admin.save();

        res.status(200).json({
            message: 'Password changed successfully...',
            password: hash,
        });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const getAllReviews = async (req, res) => {
    try {
        const pagination_index = req.query.pagination_index;
        const query_f_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.first_index;
        const query_l_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.last_index;

        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .skip(query_f_i)
            .limit(query_l_i);

        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const newSignup = async (req, res) => {
    try {
        const {
            pagination_index,
            name_search,
            language_search,
            sub_plan,
            subscription,
            is_download,
        } = req.query;

        const query_f_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.first_index;
        const query_l_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.last_index;

        const pSubscription = parseInt(subscription, 10) ?? 0;
        const pSubPlan = sub_plan === '30' ? 30 : sub_plan === '60' ? 60 : 0;

        if (pSubPlan === 30 || pSubPlan === 60) {
            if (is_download === 'true') {
                const new_sign_ups = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                            study_target: { $in: [pSubPlan] },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                            mobile: 1,
                            study_target: 1,
                            dateOfBirth: 1,
                            language: 1,
                        },
                    },
                ]).sort({ createdAt: -1 });

                res.status(200).json(new_sign_ups);
            } else {
                const new_sign_ups = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                            study_target: { $in: [pSubPlan] },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                        },
                    },
                ])
                    .sort({ createdAt: -1 })
                    .skip(query_f_i)
                    .limit(query_l_i);

                res.status(200).json(new_sign_ups);
            }
        } else {
            if (is_download === 'true') {
                const new_sign_ups = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                            mobile: 1,
                            study_target: 1,
                            dateOfBirth: 1,
                            language: 1,
                        },
                    },
                ]).sort({ createdAt: -1 });

                res.status(200).json(new_sign_ups);
            } else {
                const new_sign_ups = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                        },
                    },
                ])
                    .sort({ createdAt: -1 })
                    .skip(query_f_i)
                    .limit(query_l_i);

                res.status(200).json(new_sign_ups);
            }
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const subscribers = async (req, res) => {
    try {
        const {
            pagination_index,
            name_search,
            language_search,
            sub_plan,
            subscription,
            is_download,
        } = req.query;

        const query_f_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.first_index;
        const query_l_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.last_index;

        const pSubscription = parseInt(subscription, 10) ?? 0;
        const pSubPlan = sub_plan === '30' ? 30 : sub_plan === '60' ? 60 : 0;

        if (pSubPlan === 30 || pSubPlan === 60) {
            if (is_download === 'true') {
                const subscribers = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            $and: [
                                { payment: { $gte: pSubscription } },
                                { payment: { $gt: 0 } },
                            ],
                            study_target: { $in: [pSubPlan] },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                            mobile: 1,
                            study_target: 1,
                            dateOfBirth: 1,
                            language: 1,
                        },
                    },
                ]).sort({ createdAt: -1 });

                res.status(200).json(subscribers);
            } else {
                const subscribers = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            $and: [
                                { payment: { $gte: pSubscription } },
                                { payment: { $gt: 0 } },
                            ],
                            study_target: { $in: [pSubPlan] },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                        },
                    },
                ])
                    .sort({ createdAt: -1 })
                    .skip(query_f_i)
                    .limit(query_l_i);

                res.status(200).json(subscribers);
            }
        } else {
            if (is_download === 'true') {
                const subscribers = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            $and: [
                                { payment: { $gte: pSubscription } },
                                { payment: { $gt: 0 } },
                            ],
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                            mobile: 1,
                            study_target: 1,
                            dateOfBirth: 1,
                            language: 1,
                        },
                    },
                ]).sort({ createdAt: -1 });

                res.status(200).json(subscribers);
            } else {
                const subscribers = await User.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            $and: [
                                { payment: { $gte: pSubscription } },
                                { payment: { $gt: 0 } },
                            ],
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                        },
                    },
                ])
                    .sort({ createdAt: -1 })
                    .skip(query_f_i)
                    .limit(query_l_i);

                res.status(200).json(subscribers);
            }
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const unSubscribers = async (req, res) => {
    try {
        const {
            pagination_index,
            name_search,
            language_search,
            sub_plan,
            subscription,
            is_download,
        } = req.query;

        const query_f_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.first_index;
        const query_l_i = pagination_indexer(
            pagination_index || 0,
            50,
        )?.last_index;

        const pSubscription = parseInt(subscription, 10) ?? 0;
        const pSubPlan = sub_plan === '30' ? 30 : sub_plan === '60' ? 60 : 0;

        if (pSubPlan === 30 || pSubPlan === 60) {
            if (is_download === 'true') {
                const unsubscribers = await Unsubscribe.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                            study_target: { $in: [pSubPlan] },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                            mobile: 1,
                            study_target: 1,
                            dateOfBirth: 1,
                            language: 1,
                            reason: 1,
                        },
                    },
                ]).sort({ createdAt: -1 });

                res.status(200).json(unsubscribers);
            } else {
                const unsubscribers = await Unsubscribe.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                            study_target: { $in: [pSubPlan] },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            mobile: 1,
                            email: 1,
                            reason: 1,
                            createdAt: 1,
                        },
                    },
                ]).sort({ createdAt: -1 });

                res.status(200)
                    .json(unsubscribers)
                    .skip(query_f_i)
                    .limit(query_l_i);
            }
        } else {
            if (is_download === 'true') {
                const unsubscribers = await Unsubscribe.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            email: 1,
                            payment: 1,
                            level: 1,
                            createdAt: 1,
                            mobile: 1,
                            study_target: 1,
                            dateOfBirth: 1,
                            language: 1,
                            reason: 1,
                        },
                    },
                ]).sort({ createdAt: -1 });

                res.status(200).json(unsubscribers);
            } else {
                const unsubscribers = await Unsubscribe.aggregate([
                    {
                        $match: {
                            fullname: {
                                $regex:
                                    name_search?.toLowerCase()?.trim() || '',
                                $options: 'i',
                            },
                            language: {
                                $regex:
                                    language_search?.toLowerCase()?.trim() ||
                                    '',
                                $options: 'i',
                            },
                            payment: { $gte: pSubscription },
                        },
                    },
                    {
                        $project: {
                            __v: 1,
                            _id: 1,
                            fullname: 1,
                            mobile: 1,
                            email: 1,
                            reason: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ])
                    .sort({ createdAt: -1 })
                    .skip(query_f_i)
                    .limit(query_l_i);

                res.status(200).json(unsubscribers);
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const getAUser = async (req, res) => {
    try {
        const user_id = req.query.uid;
        const user = await User.findById(user_id);
        if (!user) throw new ResourceNotFound('User not found!');

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const deleteUsers = async (req, res) => {
    try {
        const users = req.body.users;
        const is_unsub = req.body.is_unsub || false;
        if (users?.length <= 0) throw new Forbidden('Users List Empty!');
        const objectIdsToDelete = users.map(id => new ObjectId(id));
        if (is_unsub) {
            await Unsubscribe.deleteMany({ _id: { $in: objectIdsToDelete } });
        } else {
            await User.deleteMany({ _id: { $in: objectIdsToDelete } });
        }

        res.status(200).json({ message: 'Deleted successfully!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const addALesson = async (req, res) => {
    try {
        const lesson_id = req.body.lesson_id;
        const lesson_index = req.body.lesson_index;
        const topic = req.body.topic;
        const sub_topic = req.body.subtopic;

        const lesson = await LessonTopic.find({ lesson_id: lesson_id });
        if (lesson?.length > 0)
            throw new ResourceNotFound('Lesson ID already used!');

        const new_lesson = new LessonTopic({
            lesson_id: lesson_id,
            lesson_index: lesson_index,
            lesson_topic: topic,
            lesson_sub_topic: sub_topic,
        });

        const lesson_data = await new_lesson.save();

        res.status(200).json(lesson_data);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const updateALesson = async (req, res) => {
    try {
        const l_id = req.body.l_id;
        const topic = req.body.topic;
        const sub_topic = req.body.subtopic;

        const lesson = await LessonTopic.findById(l_id);
        if (!lesson) throw new ResourceNotFound('Lesson not found!');

        lesson.lesson_topic = topic;
        lesson.lesson_sub_topic = sub_topic;

        await lesson.save();

        res.status(200).json({ message: 'Updated successfully!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const deleteALesson = async (req, res) => {
    try {
        const l_id = req.body.l_id;
        const lesson = await LessonTopic.findById(l_id);
        if (!lesson) throw new ResourceNotFound('Lesson not found!');
        await lesson.deleteOne();

        res.status(200).json({ message: 'Deleted successfully!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const listInvoice = async (req, res) => {
    const accessToken = await getAccessToken();
    try {
        const invoices = await axios.get(
            'https://api-m.sandbox.paypal.com/v2/invoicing/invoices?total_required=true',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            },
        );
        res.status(200).json(invoices.data);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const sendInvoice = async (req, res) => {
    const { invoice_id } = req.body;
    const accessToken = await getAccessToken();
    try {
        const sent = await axios.post(
            `https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoice_id}/send`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': `${process.env.PAYPAL_REQUEST_ID}`,
                },
            },
        );
        res.status(200).json(sent.data);
    } catch (err) {
        res.status(500).json(err?.message);
    }
};

const getAccessToken = async () => {
    const authHeader = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
    ).toString('base64');
    const response = await axios.post(
        'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        'grant_type=client_credentials',
        {
            headers: {
                Authorization: `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
    );

    return response.data.access_token;
};

const createSubscription = async (req, res) => {
    try {
        const id = req.body.id;
        const no_of_lessons = req.body.no_of_lessons;
        const price = req.body.price;
        const plan = req.body.plan;
        const thirty_mins = req.body.thirty_mins;
        const discount = req.body.discount;

        const pricing = await Pricing.find({ id: id });
        if (pricing?.length > 0)
            throw new ResourceNotFound('Pricing ID already used!');
        const new_subscription = new Pricing({
            id: id,
            no_of_lessons: no_of_lessons,
            price: price,
            plan: plan,
            thirty_mins: thirty_mins,
            discount: discount,
        });
        const sub_data = await new_subscription.save();

        res.status(200).json(sub_data);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const updateSubscription = async (req, res) => {
    try {
        const sub_id = req.body.sub_id;
        const id = req.body.id;
        const no_of_lessons = req.body.no_of_lessons;
        const price = req.body.price;
        const plan = req.body.plan;
        const thirty_mins = req.body.thirty_mins;
        const discount = req.body.discount;

        const pricing = await Pricing.findById(sub_id);
        if (!pricing)
            throw new ResourceNotFound('Subscription ID does not exist!');

        pricing.id = id;
        pricing.no_of_lessons = no_of_lessons;
        pricing.price = price;
        pricing.plan = plan;
        pricing.thirty_mins = thirty_mins;
        pricing.discount = discount;

        await pricing.save();

        res.status(200).json({ message: 'Updated successfully!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const deleteSubscriptions = async (req, res) => {
    try {
        const subs = req.body.subs;
        if (subs?.length <= 0) throw new Forbidden('Subscription List Empty!');
        const objectIdsToDelete = subs.map(id => new ObjectId(id));
        await Pricing.deleteMany({ _id: { $in: objectIdsToDelete } });

        res.status(200).json({ message: 'Deleted successfully!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = {
    create,
    login,
    getAUser,
    newSignup,
    subscribers,
    listInvoice,
    sendInvoice,
    getAllAdmins,
    toggleAdminStatus,
    deleteAdmins,
    getAllDashboardInfo,
    getAllReviews,
    changePassword,
    unSubscribers,
    updateALesson,
    addALesson,
    deleteALesson,
    deleteUsers,
    createSubscription,
    updateSubscription,
    deleteSubscriptions,
};
