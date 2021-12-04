let readline = require('readline');

let cli = {};
let currentUser = '';

let dbUser = {};

const login = ( nameUser ) => {
    nameUser = nameUser.toLowerCase();
    if(currentUser === ''){
        currentUser = nameUser
        initDbUser();
        console.log("\x1b[36m", `Hello, ${ currentUser }!`);
        balance();
    }else{
        console.error("\x1b[31m","Please logout fist");
    }
}

const initDbUser = () => {
    if(!dbUser[ currentUser ]){
        dbUser[ currentUser ] = {
            balance: 0,
            owedTo: [],
            owedFrom: []
        }
    }
}

const logout = () => {
    console.log("\x1b[36m", `Goodbye, ${ currentUser }!`)
    currentUser = ''
}

const deposit = ( value ) => {
    value = parseFloat( value )

    dbUser[ currentUser ].owedTo.map((val)=>{
        if(val.balance > 0){

            let currentBalance = val.balance - value;
            let deltaBalance = value
            if(value >= val.balance){
                currentBalance = 0;
                deltaBalance = val.balance
            }
            val.balance = currentBalance;
            console.log("\x1b[36m", `Transfered $${ deltaBalance } to ${ val.to }`);

            dbUser[ val.to ].owedFrom
                .filter((vfrom) => vfrom.from === currentUser )
                .map((vfrom)=>{
                    vfrom.balance = vfrom.balance - deltaBalance;
                    return vfrom
                })
            dbUser[ val.to ].balance += deltaBalance;

            value -= deltaBalance;
        }

        return val
    })

    dbUser[ currentUser ].balance += value;

    balance();
}

const balance = () => {
    let currentBalance = dbUser[ currentUser ] ? dbUser[ currentUser ].balance : 0;
    console.log("\x1b[36m", `Your balance is $${ currentBalance }`);

    dbUser[ currentUser ].owedTo.forEach((val)=>{
        if(val.balance > 0){
            console.log("\x1b[36m", `Owed $${ val.balance } to ${ val.to }`);
        }
    })

    dbUser[ currentUser ].owedFrom.forEach((val)=>{
        if(val.balance > 0){
            console.log("\x1b[36m", `Owed $${ val.balance } from ${ val.from }`);
        }
    })
}

const withdraw = ( value ) => {
    value = parseFloat( value )
    if(dbUser[ currentUser ] && value <= dbUser[ currentUser ].balance){
        dbUser[ currentUser ].balance -= value;
        console.log("\x1b[36m", `Withdrawed $${ value }`);
    }else{
        console.error("\x1b[31m","Sorry, Not enough money to withdraw");
    }
    balance();
}

const transfer = (to, value, returnBalance=true) => {
    to = to.toLowerCase()
    value = parseFloat( value )
    if(dbUser[ to ]){
        
        if(value <= dbUser[ currentUser ].balance){
            let filterOwedFromCheck = dbUser[ currentUser ].owedFrom.filter((val) => val.from === to)
            if(filterOwedFromCheck.length > 0){
                dbUser[ currentUser ].owedFrom
                    .filter((vfrom) => vfrom.from === to )
                    .map((val) => {
                        let valueTmp = value;
                        if(value >= val.balance){
                            val.balance = 0
                            value = value - val.balance
                        }else{
                            val.balance = val.balance - value
                            value = 0
                        }

                        dbUser[ to ].owedTo
                            .filter((vTo) => vTo.to === currentUser )
                            .map((vTo) => {
                                if(valueTmp >= vTo.balance){
                                    vTo.balance = 0
                                    valueTmp = valueTmp - vTo.balance
                                }else{
                                    vTo.balance = vTo.balance - valueTmp
                                    valueTmp = 0
                                }
                                dbUser[ to ].balance -= valueTmp

                                return vTo
                            })

                        return val
                    })
                dbUser[ currentUser ].balance -= value

            }else{
                dbUser[ to ].balance += value
                dbUser[ currentUser ].balance -= value
                
                console.log("\x1b[36m", `Transfered $${ value } to ${ to }`);
            }
        }else{
            let prevBalance = dbUser[ currentUser ].balance;
            let deltaBalance = (dbUser[ currentUser ].balance - value) * -1;

            let currentBalanceTo = 0
            dbUser[ currentUser ].balance = 0;
            let filterOwedTo = dbUser[ currentUser ].owedTo.filter((val) => val.to === to)
            if(filterOwedTo.length > 0){
                currentBalanceTo = filterOwedTo[0].balance
                dbUser[ currentUser ].owedTo = dbUser[ currentUser ].owedTo.filter((val) => val.to !== to)

            }
            let finalBalanceTo = currentBalanceTo + deltaBalance
            dbUser[ currentUser ].owedTo.push({
                balance : finalBalanceTo,
                to : to
            })
            
            let currentBalanceFrom = 0;
            let filterOwedFrom = dbUser[ to ].owedFrom.filter((val) => val.from === currentUser)
            if(filterOwedFrom.length > 0){
                currentBalanceFrom = filterOwedFrom[0].balance
                dbUser[ to ].owedTo = dbUser[ to ].owedFrom.filter((val) => val.from !== currentUser)
            }
            let finalBalanceFrom = currentBalanceFrom + deltaBalance
            dbUser[ to ].owedFrom.push({
                balance : finalBalanceFrom,
                from : currentUser
            })
            dbUser[ to ].balance += prevBalance;

            console.log("\x1b[36m", `Transfered $${ prevBalance } to ${ to }`);
        }
        if( returnBalance ) balance();
    }else{
        console.error("\x1b[31m","Target transfer not found");
    }
}

cli.processInput = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;
    if (str) {
        var inputs = str.split(' ');
        let iCommand = inputs[0];
        let iVal1 = inputs[1];
        let iVal2 = inputs[2];


        switch(iCommand) {
            case 'login':
                login( iVal1 );
                break;
            case 'deposit':
                deposit( iVal1 );
                break;
            case 'balance':
                balance();
                break;
            case 'withdraw':
                withdraw( iVal1 );
                break;
            case 'transfer':
                transfer( iVal1, iVal2 );
                break;
            case 'logout':
                logout();
                break;
            default:
                console.error("\x1b[31m","Error: Command not found");
                break;
        }

        /* if (inputs.length >= 3) {
            var results = 0;
            inputs.some(function (value) {
                    if (!isNaN(value)) {
                        results = results + parseInt(value);
                    }
            })
            console.log("\x1b[36m","Total is :",results);
            return true;
        } else {
            console.error("\x1b[31m","Error: Too few parameter");
            return false;
        } */
    }
}

cli.init = function () {
    console.log('\x1b[33m%s\x1b[0m', 'CLI is running');
    /* Start the interface */
    var _interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '>'
})
    /* Create an initial prompt */
    _interface.prompt(); // Will wait for input
    /* Handle each line of input separately. */
    _interface.on('line', function (str) {
        /* Send to input processor. */
        cli.processInput(str);
        /* re-initialize the prompt afterwards. */
        _interface.prompt();
    });
}

cli.init();