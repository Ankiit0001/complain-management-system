const generateComplaintTypeId = (complaintTypeName,departmentId) => {

    complaintNamePreprocessed = complaintTypeName?.split(" ").join("").toLowerCase();
    return departmentId+'_'+complaintNamePreprocessed

}

module.exports = generateComplaintTypeId;