const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const requestPromise = require('request-promise');

const nodeAddress = uuid().split('-').join(''); // remove dashes "-"

const bitcoin = new Blockchain(); // blockchain instance

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function(req, res) {
    res.send(bitcoin);
})

app.post('/transaction', function(req, res) {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({
        note: `Transaction will be added in block ${blockIndex}.`
    });
})

app.get('/mine', function(req, res) {
    const lastBlock = bitcoin.getLastBlock();
    
    // var for new block
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    }
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    // end var for new block

    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    
    bitcoin.createNewTransaction(12.5, "00", nodeAddress);

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    res.json({
        note: "New Block mined successfully",
        block: newBlock
    });
})

// register a node and broadcast it to the network
app.post('/register-and-broadcast-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1) bitcoin.networkNodes.push(newNodeUrl);

    const registerNodePromises = [];

    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { 
                newNodeUrl: newNodeUrl 
            },
            json: true
        }

        registerNodePromises.push(requestPromise(requestOptions));
    })

    Promise.all(registerNodePromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { 
                allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] 
            },
            json: true      
        }

        return requestPromise(bulkRegisterOptions);
    })
    .then(data => {
        res.json({
            note: 'New node registered with network successfully'
        })
    })
})

// register a node with the network
app.post('/register-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeDoesNotExist = bitcoin.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

    if (nodeDoesNotExist && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    res.json({
        note: 'New node registered successfully.'
    });
})

// register multiple nodes at once
app.post('register-nodes-bulk', function(req, res) {

})

app.listen(port, function() {
    console.log(`Server Running on port ${port}...`);
})