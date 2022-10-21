const Koa = require('koa');
const router = require('@koa/router')();
const koaBody = require('koa-body');
const koaAuth = require('koa-basic-auth');
const Twig = require('twig');
const twig = Twig.twig;
const views = require('koa-views');

require('dotenv').config();

async function home(ctx) {
    ctx.body = 'Home';
}

async function admin_home(ctx) {
    ctx.body = 'Admin Home';
}

const app = new Koa();
router
    .get('/', home)
    .get('admin', '/admin', koaAuth({name: 'admin', pass: 'test'}), admin_home, );

app.use(koaBody())
app.use(router.routes());

app.listen(3000);
console.log('Application has started');