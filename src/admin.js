const { Vonage } = require('@vonage/server-sdk');
const { SMS } = require('@vonage/messages/dist/classes/SMS/SMS');
const { Op } = require('sequelize');
const models = require('./../models');
const Anagram = models.Anagram;
const Mobile = models.Mobile;

const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    privateKey: Buffer.from(process.env.VONAGE_PRIVATE_KEY, 'base64'),
    applicationId: process.env.VONAGE_APPLICATION_ID,
});

module.exports = {
    async admin_home(ctx) {
        if (ctx.request.body.anagram && ctx.request.body.solution) {
            const newAnagram = await Anagram.create({ anagram: ctx.request.body.anagram, solution: ctx.request.body.solution, current: false, used: false });
        }
        const anagrams = await Anagram.findAll({
            order: [
                ['current', 'DESC'],
                ['anagram', 'ASC']
            ]
        });
        const mobileNumbers = await Mobile.findAll();
        await ctx.render('admin/index', { anagrams, mobileNumbers });
    },
    
    async admin_set_current(ctx) {
        const anagram = await Anagram.findByPk(ctx.request.query.id);
        if (anagram) {
            await Anagram.update({ current: false }, { where: { id: { [Op.gt]: 0 } } });
            anagram.current = true;
            anagram.used = true;
            await anagram.save();
        }
        ctx.redirect('/admin');
    },
    
    async admin_delete_anagram(ctx) {
        const anagram = await Anagram.findByPk(ctx.request.query.id);
        if (anagram) {
            Anagram.destroy({ where: { id: ctx.request.query.id } });
        }
        ctx.redirect('/admin');
    },

    async admin_clear_anagram(ctx) {
        await Anagram.update({ current: false }, { where: { id: { [Op.gt]: 0 } } });
        ctx.redirect('/admin');
    },
    
    async admin_delete_number(ctx) {
        const mobile = await Mobile.findByPk(ctx.request.query.id);
        if (mobile) {
            mobile.destroy({ where: { id: ctx.request.query.id } });
        }
        ctx.redirect('/admin');
    },
    
    async admin_notify(ctx) {
        const numbers = await Mobile.findAll({ where: { notify: true } });
        numbers.forEach(number => {
            vonage.messages.send(
                new SMS(
                    "This is Vonage! We just want to let you know the anagram has changed. Good luck!",
                    number.mobile_number,
                    process.env.VONAGE_FROM
                )
            );
        });
        ctx.redirect('/admin');
    }
}