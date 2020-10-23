const generatorOTP=()=>{
    return Math.floor(1000 + Math.random() * 9000)
}

console.log(generatorOTP())

var d = new Date().getTime()

// console.log(d)

// const dateformat=()=>{

// }
var currentdate = new Date(); 
var datetime =  currentdate.getFullYear()+ "-"
                + (currentdate.getMonth()+1)  + "-" 
                + currentdate.getDate() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();

// console.log(currentdate)
// console.log(datetime)

const dateformat=(n)=>{
    var today = new Date(n);
    var dd = ((today.getDate() < 10)?"0":"") + today.getDate()
    var mm = (((today.getMonth()+1) < 10)?"0":"") + (today.getMonth()+1)
    var yyyy = today.getFullYear()
    var hr = ((today.getHours() < 10)?"0":"") + today.getHours()
    var mn = ((today.getMinutes() < 10)?"0":"") + today.getMinutes()
    var sec = ((today.getSeconds() < 10)?"0":"") + today.getSeconds()
  
    // today =dd + '-' + mm + '-' + yyyy
    today = yyyy + '-' + mm + '-' + dd + ' ' + hr + ':' + mn + ':' + sec
    return today
}

console.log(dateformat())

const dateformatlain=()=>{
    // For todays date;
    Date.prototype.today = function () { 
        return this.getFullYear() +"-"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ ((this.getDate() < 10)?"0":"") + this.getDate();
    }
    // For the time now
    Date.prototype.timeNow = function () {
         return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    }
    
    return new Date().today() + " " + new Date().timeNow();

}

console.log(dateformatlain())