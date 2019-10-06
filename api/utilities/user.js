module.exports.checkLogInStatus = (req,res) => {
    if(req.session.hasOwnProperty('user') && req.session.user.hasOwnProperty('id'))
        return req.session.user.id;
    else
        return false;
}