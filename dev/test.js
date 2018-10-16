const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const previousBlockHash = 'HUIHUIHIUHIU7867826723HJ';
const currentBlockData = [
    {
        amount: 100,
        sender: 'Monify Media',
        recipient: 'Flatworld Solutions'
    },
    {
        amount: 50,
        sender: 'Sobrecarey St.',
        recipient: '59A Father Selga'
    },
    {
        amount: 10,
        sender: 'Monify Media',
        recipient: 'Flatworld Solutions'
    }        
];

nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

result = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
console.log(result);
 