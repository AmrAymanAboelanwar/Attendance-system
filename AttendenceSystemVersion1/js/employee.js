window.addEventListener('load', function () {

    var employeeList = [];
    var attList = [];

    $.ajax({
        url: "../data/employee.json",
        type: "get",
        success: data => {
            employeeList = data;
            console.log(data)
        },
        error: console.log("error")
    });


    $.ajax({
        url: "../data/attendance.json",
        type: "get",
        success: data => {

            attList = data;
            console.log("sdsds" + data)

        },
        error: console.log("error")

    });



    empObj = this.sessionStorage.getItem('emp');
    empData = JSON.parse(empObj);

    let isSubAdmin = empData['isSubAdmin'];
    console.log(isSubAdmin);

    let name = this.document.getElementById('name');
    let address = this.document.getElementById('address');
    let age = this.document.getElementById('age');
    name.innerText = empData.username
    address.innerText = empData.address;
    age.innerText = empData.age;

    isSubAdmin ? $('#subAdmin').show() : $('#subAdmin').hide();



    var month = new Date().toLocaleDateString('en-US').split('/')[0];
    var day = new Date().toLocaleDateString('en-US').split('/')[1];
    var year = new Date().toLocaleDateString('en-US').split('/')[2];
    var time = new Date().toLocaleTimeString('en-US');
    var hour = new Date().toLocaleTimeString('en-US').split(':')[0];
    var minutes = new Date().toLocaleTimeString('en-US').split(':')[1];
    var status = new Date().toLocaleTimeString('en-US').split(':')[2].split(' ')[1];
    var date = new Date().toLocaleDateString('en-US');


    pivotTime = {
        "hour":9,
        "min": 00,
        "sta": "AM",
    };


    $('.showData').on('click', e => {

        var empAttendencies = attList.filter(e => e.eid == empData.id);
        var isAttendToday = empAttendencies.find(e => e.date == date);

        if (isAttendToday) {
            var dHour = isAttendToday.delay.split(":")[0];
            var dMin = isAttendToday.delay.split(":")[1];

            $('#attTime').text(isAttendToday.time);
            $('#delTime').text(`${dHour} hour : ${dMin} min`);
        }
        else {
            $('#attTime').css({ "color": "red" }).text("  (not attend today) ")
            $('#delTime').css({ "color": "red" }).text('(not attend today)')
        }

        $('#attTimes').text(empAttendencies.filter(e => e.isAttend == true && e.date.split('/')[0] == month).length);
        $('#lateTimes').text(empAttendencies.filter(e => e.late == true && e.date.split('/')[0] == month).length);

        var attendDays = empAttendencies.filter(e => {
            myMonth = e.date.split('/')[0];
            myYear = e.date.split('/')[2];
            return myMonth == month && myYear == year
        });

        $('#abseTimes').text(Number.parseInt(day) - attendDays.length);

    })


    flagH = flagM = false;
    $('#attBtn').on('click', e => {

        let inputCode = $('#codeInput').val();
        if (!(isNaN(inputCode) || inputCode.length < 1)) {
            //this.alert('yes');
           
            var emp = employeeList.find(e => e.code == inputCode);
           
            if (emp) {
                $('#errorSpan').hide();
               
                var empAttendens = attList.filter(e => e.eid == emp.id)
                var attendToday = empAttendens.find(e => e.date == date);

                if (attendToday) {
                    $('#errorSpan').text("this code is enterd before").show();
                }
                else {

                    if ((hour >= pivotTime.hour + 2) && status == pivotTime.sta || status != pivotTime.sta) {
                        $('#errorSpan').text("sorry today is invalid").show();
                    }
                    else {
                        $('#errorSpan').hide();

                        if (hour == pivotTime.hour && pivotTime.sta === status) {
                            flagH = true;
                            if (Number.parseInt(minutes) <= pivotTime.min) {
                                flagM = true
                            }
                        }
                        else if (hour < pivotTime.hour && pivotTime.sta === status) {
                            flagM = flagH = true;
                        }
                        if (flagH && flagM) {
                            //attend and not late
                            attList.push(new Attend(time, date, false, true, "0:00", emp.id));
                        }
                        else {
                            //attend and  late
                            var delyTime = getDelayTime(pivotTime);
                            attList.push(new Attend(time, date, true, true, delyTime, emp.id));

                        }

                        $('.alert').html(`<h3>username =  ${emp.username}<h3> <p>time =  ${time}</p>`).fadeIn(4000).slideUp(1000);

                        setTimeout(e => SaveData(attList), 5000);
                    }
                }
            }

            else {
                //'no'
                // show span this code no valid
                $('#errorSpan').show();
            }

        }
        else {
            this.alert('enter only number ')
        }

    });




});



  function SaveData(arr) {
    console.log(arr);
    var _StoreData = new Blob([JSON.stringify(arr)], { type: "appliction/json" });
    var Linkelement = document.createElement("a");
    Linkelement.href = window.webkitURL.createObjectURL(_StoreData);
    Linkelement.setAttribute("download", "attendance.json");
    document.body.appendChild(Linkelement);
    Linkelement.click();
    document.body.removeChild(Linkelement);
  }

  function getDelayTime(myTime) {
    var t1 = myTime;
    var t2 = new Date().toLocaleTimeString().split(":");
    return `${t2[0] - t1.hour}:${t2[1] - t1.min}`
  }