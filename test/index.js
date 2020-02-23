module.exports = {
    loadUsers: function(toolbox){
        toolbox.db.any('select * from users where dt > $1', [new Date(2020, 0, 1)])
        .then(rows => {
            rows.forEach(row => {
                console.log(row.id, row.phone);
            });
        })
        .catch(error => {
            console.log('ERROR:', error); // print the error;
        })
        .finally(toolbox.db.$pool.end); // For immediate app exit, shutting down the connection pool
    // For details see: https://github.com/vitaly-t/pg-promise#library-de-initialization
    }
}
