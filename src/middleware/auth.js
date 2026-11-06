const jwt = require('jsonwebtoken');

const auth = {
    verifyToken: (req, res, next) => {
        // BUG #36 fixed: Node normalizes request header names to lowercase.
        const authorization = req.headers.authorization;
        const match = typeof authorization === 'string'
            ? authorization.match(/^Bearer\s+(.+)$/i)
            : null;

        if (!match) {
            // BUG #37 fixed: Missing credentials are unauthorized.
            return res.status(401).json({ message: 'Authentication required' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({ message: 'Internal server error' });
        }

        try {
            // BUG #38 fixed: Verify the signature and claims; only accept HS256 tokens.
            const payload = jwt.verify(match[1], secret, {
                algorithms: ['HS256']
            });

            if (
                !payload ||
                typeof payload !== 'object' ||
                typeof payload.sub !== 'string' ||
                !payload.sub
            ) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            // BUG #39 fixed: Expose verified identity claims to downstream handlers.
            req.user = payload;
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    }
};

module.exports = auth;
