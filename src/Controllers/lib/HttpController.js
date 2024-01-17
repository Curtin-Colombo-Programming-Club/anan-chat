const path = require("path");
const cookieParser = require('cookie-parser');

class Controller {
    constructor(app) {
        this.templatePath = path.join(process.cwd(), "./templates");
        this.app = app;
        this.httpStatusCodes = [
            100, 101, 102, 103,
            200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
            300, 301, 302, 303, 304, 305, 307, 308,
            400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451,
            500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511
        ];
    }

    sendTemplate(res, file) {
        res.sendFile(`${this.templatePath}/${file}`);
    }

    control() {
        // cookie parser
        this.app.use(cookieParser());

        // Custom error handling middleware
        this.app.use((err, req, res, next) => {
            // Log the error for debugging purposes
            console.error(err.stack);

            // Set the status code based on the error or use a default 500 status
            res.status(err.status || 500);

            // Redirect to your custom error page
            res.redirect('/error');
        });

        this.app.get("/", async (req, res) => {
            this.sendTemplate(res, "chat.html");
        });

        this.app.get("/chat", async (req, res) => {
            this.sendTemplate(res, "chat.html");
        });

        // static files
        this.app.get("/static/:subDir/:file", async (req, res) => {
            const { subDir, file } = req.params;
            res.sendFile(path.join(process.cwd(), `./static/${subDir}/${file}`));
        });

        // error
        this.app.get("/error", async (req, res) => {
            console.log(req.cookies.errorStatus);
            let status = req.cookies.errorStatus || req.query.status;

            try {
                status = parseInt(status);

                if (this.httpStatusCodes.includes(status)) {
                    res.status(parseInt(status));
                }
                
                this.sendTemplate(res, "error.html");

            }
            catch (err) {
                console.log(err.message);
                res.cookie("errorStatus", 400, {path: "/error"});
                res.redirect('/error');
            }
        })

        this.app.all('*', (req, res) => {
            res.cookie("errorStatus", 404, {path: "/error"});
            res.redirect('/error');
        });
    }
}

module.exports = Controller;