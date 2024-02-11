module.exports.getError500 = (err, req, res, next) => {
    res.status(500).render('error500', { error: err});  //error: err
}

module.exports.getError404 = (req, res, next) => {
    res.status(404).render('error404');
}