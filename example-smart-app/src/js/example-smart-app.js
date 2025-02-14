(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        
        var pt = patient.read();
        
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4', 
                              'http://loinc.org|2093-3']
                      }
                    }
                  });
        
        console.log("******************patient**************************")
        let strpatient = JSON.stringify(patient, null, 4);
        console.log(strpatient)

        $("#target").click(function() {
          let text;
          let toEdit = prompt("Please enter observation you wish to update:", "Cholesterol");
          if (toEdit != null || toEdit != "") {
            patient.update({
              type: "Patient",
              id: '5e8abafb-8a79-4f79-9311-1211b9e6bd1a',
              resource: {
                name: 'updatedNew Name'
              }
          }).catch(function(e){
              console.log('An error happened while updating patient: \n' + JSON.stringify(e));
              throw e;
          }).then(function(bundle){
              console.log('Updating patient successed');
          });
          }
          return text;
        });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          
          console.log("******************pt**************************")
          let strPt = JSON.stringify(patient, null, 4);
          console.log(strPt)
          
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;
          
          var choles = '';

          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');
          
          console.log("******************ldl**************************")
          let strldl = JSON.stringify(ldl, null, 4);
          console.log(strldl)
          
          var choles = byCodes('2093-3');
          let cholesStr = JSON.stringify(choles, null, 4)
          console.log("***************choles=   " + cholesStr);

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height[0]);
          
          p.choles = getQuantityValueAndUnit(choles[0]);
      

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
      choles: {value: ''}
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
    $('#choles').html(p.choles);
  };

})(window);
