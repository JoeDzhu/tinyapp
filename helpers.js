const getUserByEmail = function(email, database) {


  for(let u in database) {

    if(email === database[u].email) {//即便是调用了u在usersD，注意如果还是dot notation，还是会直接调用值email/pw，而不是变量email/pw;
      return database[u];//return the whore obj.
    }

  } return undefined;
};

module.exports = { getUserByEmail };