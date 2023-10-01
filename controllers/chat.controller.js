const openai = require('../config/openai.config');

const chat = async (req, res) => {
    const user_input = req.body?.messages;
    try {
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: user_input,
        });
        const completion_text = completion.data.choices[0].message.content;
        res.status(200).json({
            chat_res: completion_text,
        });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = chat;
