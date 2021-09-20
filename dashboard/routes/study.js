module.exports = function attachRoutes(app, config) {

    app.get('/study/amazon-assisted', (req, res) => {
        res.render('evaluation/amazon-assisted.ejs', {account:req.session});
    });

    app.get('/study/amazon-not-assisted', (req, res) => {
        res.render('evaluation/amazon-not-assisted.ejs', {account:req.session});
    });

}