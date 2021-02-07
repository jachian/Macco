

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\
//
//define schema for storage of verification keys when a person creates an account
const verificationSchema = mongoose.Schema({ code : String,    // hash(email + randNum + password)
                                             createDate : Date });                 // the date that is verification code was created

// generating a hash
verificationSchema.methods.generateHash = function(code)
{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


module.exports = mongoose.model('Veri', verificationSchema);
