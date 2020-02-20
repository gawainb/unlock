const Units = require('ethereumjs-units')

const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let locks

contract('Lock / purchaseForFrom', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  describe('if the referrer does not have a key', () => {
    it('should succeed', async () => {
      const lock = locks.FIRST
      await lock.purchase(0, accounts[0], accounts[1], [], {
        value: Units.convert('0.01', 'eth', 'wei'),
      })
    })
  })

  describe('if the referrer has a key', () => {
    it('should succeed', async () => {
      const lock = locks.FIRST
      await lock.purchase(0, accounts[0], web3.utils.padLeft(0, 40), [], {
        value: Units.convert('0.01', 'eth', 'wei'),
      })
      await lock.purchase(0, accounts[1], accounts[0], [], {
        value: Units.convert('0.01', 'eth', 'wei'),
      })
    })

    it('can purchaseForFrom a free key', async () => {
      await locks.FREE.purchase(0, accounts[0], web3.utils.padLeft(0, 40), [])
      const tx = await locks.FREE.purchase(0, accounts[2], accounts[0], [])
      assert.equal(tx.logs[1].event, 'Transfer')
      assert.equal(tx.logs[1].args.from, 0)
      assert.equal(tx.logs[1].args.to, accounts[2])
    })
  })
})
