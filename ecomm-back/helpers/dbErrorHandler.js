"use strict";

//get unique error field name
const uniqueMessage = error => {
    let output;
    try{
        let fieldName = error.errmsg.substring(
            error.message.lastIndexOf(".$") + 2,
            error.message.lastIndexOf("_1")
        );
        output = `${fieldName} already exists!`
        }
        catch(ex) {
            output = "Unique field already exists"
        }
    return output;
}

//get the erroror message from error object
exports.errorHandler = error => {
    let message = "";

    if(error.code) {
        switch(error.code) {
            case 11000:
                message = uniqueMessage(error)
                break;
            case 11001:
                message = uniqueMessage(error)
                break;
            default: 
                message = "Something went wrong."
        }
        return message;
    }
    else{
        for (let errorName in error.errorors){
            if(error.errorors[errorName].message){
                message = error.errorors[errorName].message
            }
        }
        return message;
    }
    
}