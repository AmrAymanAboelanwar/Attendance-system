$(function () {

    table = document.getElementById('empTable');

    $.ajax({
        url: "../data/waitingEmp.json",
        type: "get",
        success: data => {

            empList = data;

            console.log(data.length);
            console.log(empList.length);
            createWaitingRow(data);
        },
        error: console.log("error")
    });


    $.ajax({
        url: "../data/employee.json",
        type: "get",
        success: data => {
            employeeList = data;
            console.log(employeeList);
        },
        error: console.log("error")
    });

    $.ajax({
        url: "../data/attendance.json",
        type: "get",
        success: data => {
            attList = data;

        },
        error: console.log("error")
    });

    approveBtn = document.getElementsByClassName('');

    //reject
    $("table").on('click', '.rejectBtn', function (e) {
        if (confirm("are you sure to reject this employee")) {
            id = e.target['id'];
            newEmpList = empList.filter(myemp => myemp.id != id);
            empList = [];
            empList = newEmpList;
            createWaitingRow(empList);
            
        }
    });

    //approve
    $("table").on('click', '.approveBtn', function (e) {

        if (confirm("saved it ")) {
            id = e.target['id'];
            var empObj = empList.find(myemp => myemp.id == id);
            empList.splice(empList.indexOf(empObj), 1);
            createWaitingRow(empList);
            attCode = generateRandomNumber()
            sendEmail(empObj, attCode);
            newId = (employeeList[employeeList.length - 1].id) + 1;
            var emp = new Employee(newId, empObj.username, empObj.password, empObj.email, empObj.address, empObj.age, empObj.isSubAdmin, attCode);
            employeeList.push(emp);
        }

    });

    $('a').on('click', e => {

        switch ($(e.target).text()) {
            case 'All Employees':

                AllEmployees(employeeList);

                break;
            case 'Full Report':


                reports(employeeList, attList, false);

                break;
            case 'Late Report':

                reports(employeeList, attList, true);
                break;
        }

    })


    $('#save').on('click', e => SaveData(empList));

    $('#saveapproved').on('click', e => SaveData(employeeList));
});
// end of script
function createWaitingRow(waitingEmpDataArr) {
    $('table:first').html('');
    for (let i = 0; i < waitingEmpDataArr.length; i++) {

        var tr = document.createElement('tr');

        var td1 = document.createElement('td');
        td1.innerText = waitingEmpDataArr[i].username;
        var td2 = document.createElement('td');
        td2.innerText = waitingEmpDataArr[i].email;

        var td3 = document.createElement('td');
        td3.innerText = waitingEmpDataArr[i].age;

        var td4 = document.createElement('td');
        var td5 = document.createElement('td');


        var approveBtn = document.createElement('button');
        approveBtn.innerText = "approve";
        $(approveBtn).attr('id', waitingEmpDataArr[i].id);
        $(approveBtn).addClass('btn btn-success approveBtn');
        td4.appendChild(approveBtn)

        var rejectBtn = document.createElement('button');
        rejectBtn.innerText = "reject";
        $(rejectBtn).attr('id', waitingEmpDataArr[i].id);
        $(rejectBtn).addClass('btn btn-danger rejectBtn');
        td5.appendChild(rejectBtn);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        $('table:first').append(tr);
    }
}

function AllEmployees(arr) {
    var empTable = $('#empTable2');
    $(empTable).empty();
    var header = '<tr><th> name </th><th>email</th><th> age </th><th>code </th></tr>'
    $(empTable).append(header);
    for (let i = 0; i < arr.length; i++) {
        $(empTable).append(`<tr><td> ${arr[i].username} </td><td> ${arr[i].email} </td><td>${arr[i].age} </td><td> ${arr[i].code} </td></tr>`);
    }


}

function reports(emps, attent, showLate) {
    var header;
    var empTable = $('#empTable2');
    $(empTable).empty();
    if (showLate) {
        header = '<tr><th> name </th><th>late</th>'
    }
    else {
        header = '<tr><th> name </th><th>late</th><th> attend </th><th> absence </th></tr>'
    }

    $(empTable).append(header);
   
    for (let i = 0; i < emps.length; i++) {

        n = attent.filter(e => e.eid == emps[i].id);

        var month = new Date().toLocaleDateString('en-US').split('/')[0];
        var day = new Date().toLocaleDateString('en-US').split('/')[1];
        var year = new Date().toLocaleDateString('en-US').split('/')[2];

        var attendDays = n.filter(e => {
            myMonth = e.date.split('/')[0];
            myYear = e.date.split('/')[2];
            return myMonth == month && myYear == year
        });

        if (showLate) {
            $(empTable).append(`<tr><td> ${emps[i].username} </td><td> ${n.filter(e => e.late).length} </td></tr>`)
        }
        else {
            $(empTable).append(`<tr><td> ${emps[i].username} </td><td> ${n.filter(e => e.late).length} </td><td> ${n.filter(e => e.isAttend).length} </td><td> ${Number.parseInt(day) - attendDays.length} </td></tr>`)
        }
    }
}


function SaveData(arr) {
    var _StoreData = new Blob([JSON.stringify(arr)], { type: "appliction/json" });
    var Linkelement = document.createElement("a");
    Linkelement.href = window.webkitURL.createObjectURL(_StoreData);
    Linkelement.setAttribute("download", "employee.json");
    document.body.appendChild(Linkelement);
    Linkelement.click();
    document.body.removeChild(Linkelement);
}

function sendEmail(data, code) {
    var Linkelement = document.createElement("a");
    Linkelement.href = `mailto:${data.email}?subject=conirmation for acception&body= welcome ${data.username} your code is ${code}`;
    Linkelement.click();
}

function generateRandomNumber() {
    return Math.floor(Math.random() * 100000) + 1000;
}