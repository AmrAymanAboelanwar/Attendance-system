
window.addEventListener('load', function () {
    SaveDataBtn = document.getElementById('save');
    var usernameInput = document.getElementById('loginUsername');
    var passwordInput = document.getElementById('loginPassword');
    var usernameSignInput = document.getElementById('usernameSignInput');
    var passwordSignInput = document.getElementById('passwordSignInput');
    var emailSignInput = document.getElementById('emailSignInput');
    var addressSignInput = document.getElementById('addressSignInput');
    var ageSignInput = document.getElementById('ageSignInput');
    var errorLoginP = document.getElementById("errorLogin");

    var adminData = {};
    //get admin data
    $.ajax({
        url: "../data/adminData.json",
        type: "get",
        success: data => adminData = { userName: data["username"], password: data["password"], email: data["email"] },
        error: console.log("error")
    });

    // get employee data
    var empList = [];
    $.ajax({
        url: "../data/employee.json",
        type: "get",
        success: data => empList = data,
        error: console.log("error")
    });

    waitingListData = [];
    $.ajax({
        url: "../data/waitingEmp.json",
        type: "get",
        success: data => waitingListData = data,
        error: console.log("error")
    });


    document.forms[0].addEventListener('submit', function (e) {
        var emp = isEmp(empList, usernameInput.value, passwordInput.value);
        var admin = isAdmin(adminData, usernameInput.value, passwordInput.value);

        if (emp != null || admin) {

            if (admin) {
                //admin page
                this.setAttribute("action", "AttendenceSystemVersion1\pages\AdminPage.html");
            }
            else {
                // emp page
                sessionStorage.setItem('emp', JSON.stringify(emp));
                this.setAttribute("action", "AttendenceSystemVersion1\pages\EmployeePage.html");
            }

        }
        else {
            e.preventDefault();
            errorLoginP.style.display = 'block';
            usernameInput.classList.add('error');
            passwordInput.classList.add('error');
        }

    });


   
    document.forms[1].addEventListener('submit', function (e) {
        e.preventDefault();
        id = waitingListData[waitingListData.length - 1].id+1;
        newEmp = new Employee(id, usernameSignInput.value, passwordSignInput.value, emailSignInput.value, addressSignInput.value, getAge(ageSignInput.value), false, null)
        waitingListData.push(newEmp);
        sendEmail(newEmp, adminData.email);
        $(SaveDataBtn).removeClass('d-none');
    });

    $(SaveDataBtn).click(function (e) {
        SaveData(waitingListData);
    });
}); //end of script



function sendEmail(data, adminEmail) {

    var Linkelement = document.createElement("a");
    Linkelement.href = `mailto:${adminEmail}?subject=add new emp &body= my data is
                username ${data.username}
                email ${data.email}
                address ${data.address}
                age ${data.age}`;
    Linkelement.click();

}


  function getAge(_mydate) {
    data = _mydate.split('-');
   return new Date().getFullYear() - data[0];
 }

function isEmp(empList, user, pass) {
    return empList.find(e => e.username == user && e.password == pass);
}
function isAdmin(admin, user, pass) {
    return (admin.userName == user && admin.password == pass);
}

function SaveData(arr) {
    var _StoreData = new Blob([JSON.stringify(arr)], { type: "appliction/json" });
    var Linkelement = document.createElement("a");
    Linkelement.href = window.webkitURL.createObjectURL(_StoreData);
    Linkelement.setAttribute("download", "waitingEmp.json");
    document.body.appendChild(Linkelement);
    Linkelement.click();
    document.body.removeChild(Linkelement);
}