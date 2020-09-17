const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const tokenList = {};
const router = express.Router();

router.get('/', (request, response) => {
    response.send('Holle');
});

router.get('/status', (request, response) => {
    response.status(200).json({ message: 'ok', status: 200});
});

router.post('/signup', passport.authenticate('signup', { session: false }), async (request, response, next) => {
    response.status(200).json({ message: 'signup successful', status: 200});
});

router.post('/login', async (request, response, next) => {
    passport.authenticate('login', async (error, user) => {
        try{
            if(error){
                return next(error);
            }
            if(!user){
                return next(new Error('email and password are required'));
            }

            request.login(user, {session:false}, (err) => {
                if(err) return next(err);
                
                // create our jwt
                const body = {
                    _id: user._id,
                    email: user.email,
                    name: user.username,
                };

                const token = jwt.sign({user: body }, process.env.JWT_SECRET, { expiresIn: 300 });
                const refreshToken = jwt.sign({user: body }, process.env.JWT_REFRESH_SECRET, { expiresIn: 86400 });

                // Store tokens in cookie
                response.cookie('jwt', token);
                response.cookie('refreshJwt', refreshToken);

                // Store tokens in memory
                tokenList[refreshToken] = {
                    token,
                    refreshToken,
                    email: user.email,
                    _id: user._id,
                    name: user.name,
                };

                // Send token to user
                return response.status(200).json({ token, refreshToken, status: 200});
            });

        } catch(err) {
            console.log(err);
            return next(err);
        }
    })(request, response, next);
});

router.post('/logout', (request, response) => {
    if(request.cookies){
        const refreshToken = request.cookies.refreshJwt;
        if(refreshToken in tokenList) delete tokenList[refreshToken];
        response.clearCookie('jwt');
        response.clearCookie('refreshJwt');

    //     response.status(200).json({ message: 'logged out', status: 200});
    // } else {
    //     response.status(400).json({ message: 'invalid request', status: 400});
    }
    response.status(200).json({ message: 'logged out', status: 200});
});

router.post('/token', (request, response) => {
    if(!request.body || !request.body.refreshToken){
        response.status(400).json({ message: 'invalid body', status: 400});
    }else{
        const { refreshToken } = request.body;
        response.status(200).json({ message: `refresh token requested for token: ${refreshToken}`, status: 200});
    }
});

module.exports = router;
