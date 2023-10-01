const User = require('../models/user.model');

const activate_lesson = async (req, res) => {
    try {
        const user_id = req.body?.user_id;
        const lesson_id = req.body?.lesson_id;
        const lesson_num = req.body?.lesson_num;

        const user = await User.findById(user_id);
        if (!user) throw new ResourceNotFound('User does not exist');

        if (
            lesson_num >
            (user.lessons?.filter(item => item?.id === lesson_id)?.[0]
                ?.lessons || 0)
        ) {
            if (user.payment > 0) {
                let new_lessons = [];

                const l_group = user.lessons?.filter(
                    item => item?.id === lesson_id,
                );

                //! If the lesson exist, add it the lesson else, add a new lesson
                if (l_group?.length > 0) {
                    new_lessons = [...user.lessons].map(item => {
                        if (item?.id === lesson_id) {
                            return {
                                id: lesson_id,
                                score: [...item.score],
                                lessons: lesson_num,
                            };
                        } else {
                            return item;
                        }
                    });
                } else {
                    new_lessons = [
                        ...user?.lessons,
                        {
                            id: lesson_id,
                            score: [],
                            lessons: lesson_num,
                        },
                    ];
                }

                await User.findByIdAndUpdate(user_id, {
                    lessons: new_lessons,
                    payment: user.payment - 1,
                });

                const user_data = await User.findById(user_id);
                if (!user_data) throw new ResourceNotFound('An Error Occured!');

                const newLesson = user_data.lessons?.filter(
                    item => item?.id === lesson_id,
                )?.[0];
                res.status(200).json(newLesson);
            } else {
                res.status(500).json(
                    'Lesson Payment Exhausted, Please Re-subscribe!',
                );
            }
        } else {
            const tempLesson = user.lessons?.filter(
                item => item?.id === lesson_id,
            )?.[0];
            res.status(200).json(tempLesson);
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const set_homework_score = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const lesson_id = req.body?.lesson_id;
        const sub_lesson_id = req.body?.sub_lesson_id; // Index of the Lesson Topic in the Frontend
        const lesson_score = req.body?.lesson_score;

        const user = await User.findById(user_id);
        if (!user) throw new ResourceNotFound('User does not exist');

        const updateScoreById = ({ data, id, sub_id, score }) => {
            return data.map(obj => {
                const scores = obj?.score || [];
                if (obj.id === id) {
                    return {
                        ...obj,
                        score:
                            (scores?.length || 0) > sub_lesson_id
                                ? scores.map((val, ind) => {
                                      return ind === sub_lesson_id
                                          ? lesson_score
                                          : val;
                                  })
                                : (scores?.length || 0) > 0
                                ? [...scores, lesson_score]
                                : [lesson_score],
                    };
                }
                return obj;
            });
        };

        user.lessons = updateScoreById({
            data: [...user?.lessons],
            id: lesson_id,
            sub_id: sub_lesson_id,
            score: lesson_score,
        });
        await user.save();

        res.status(200).json('Successful');
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const set_exam_score = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const exam_lvl = req.body?.exam_lvl;
        const exam_score = req.body?.exam_score;

        const user = await User.findById(user_id);
        if (!user) throw new ResourceNotFound('User does not exist');

        const updateScoreById = ({ data, level, score }) => {
            return data.map(obj => {
                if (obj.level === level) {
                    return {
                        ...obj,
                        score: score,
                    };
                }
                return obj;
            });
        };

        user.exams = updateScoreById({
            data: [...user?.exams],
            level: exam_lvl,
            score: exam_score,
        });

        if (exam_score >= 80) {
            switch (user.level) {
                case 'Beginner':
                    user.level = 'Pre-Intermediate';
                    await user.save();
                    res.status(200).json({
                        level_up: true,
                        level: 'Pre-Intermediate',
                    });
                    break;
                case 'Pre-Intermediate':
                    user.level = 'Intermediate';
                    await user.save();
                    res.status(200).json({
                        level_up: true,
                        level: 'Intermediate',
                    });
                    break;
                case 'Intermediate':
                    user.level = 'Upper-Intermediate';
                    await user.save();
                    res.status(200).json({
                        level_up: true,
                        level: 'Upper-Intermediate',
                    });
                    break;
                case 'Upper-Intermediate':
                    user.level = 'Confident';
                    await user.save();
                    res.status(200).json({
                        level_up: true,
                        level: 'Confident',
                    });
                    break;
                case 'Confident':
                    user.level = 'Confident';
                    await user.save();
                    res.status(200).json({
                        level_up: false,
                        level: 'Confident',
                    });
                    break;
                default:
                    user.level = 'Beginner';
                    await user.save();
                    res.status(200).json({
                        level_up: false,
                        level: 'Beginner',
                    });
                    break;
            }
        } else {
            res.status(200).json({
                level_up: false,
                level: exam_lvl,
            });
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = {
    activate_lesson,
    set_homework_score,
    set_exam_score,
};
