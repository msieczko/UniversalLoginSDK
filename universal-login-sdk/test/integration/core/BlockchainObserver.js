import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {solidity, createFixtureLoader} from 'ethereum-waffle';
import {Wallet, utils} from 'ethers';
import MESSAGE_DEFAULTS from '../../../lib/core/utils/MessageDefaults';
import {MANAGEMENT_KEY} from '@universal-login/commons';
import basicSDK from '../../fixtures/basicSDK';

chai.use(solidity);
chai.use(sinonChai);

const loadFixture = createFixtureLoader();

describe('INT: BlockchainObserver', async () => {
  let relayer;
  let sdk;
  let blockchainObserver;
  let privateKey;
  let contractAddress;
  let wallet;
  let otherWallet;
  let otherWallet2;
  let mockToken;

  beforeEach(async () => {
    ({relayer, sdk, mockToken, contractAddress, wallet, otherWallet, otherWallet2, privateKey} = await loadFixture(basicSDK));
    ({blockchainObserver} = sdk);
    blockchainObserver.step = 50;
    blockchainObserver.lastBlock = 0;
  });

  afterEach(async () => {
    await relayer.clearDatabase();
  });

  it('subscribe: should emit AddKey on construction', async () => {
    [privateKey, contractAddress] = await sdk.create('me.mylogin.eth');
    await mockToken.transfer(contractAddress, utils.parseEther('20'));
    const {address} = new Wallet(privateKey);
    const callback = sinon.spy();
    const filter = {contractAddress, key: address};
    await blockchainObserver.subscribe('KeyAdded', filter, callback);
    await blockchainObserver.fetchEvents();
    expect(callback).to.have.been.calledWith({key: address.toLowerCase(), purpose: MANAGEMENT_KEY});
  });

  it('subscribe: should emit AddKey on addKey', async () => {
    const callback = sinon.spy();
    const paymentOptions = {...MESSAGE_DEFAULTS, gasToken: mockToken.address};
    const filter = {contractAddress, key: wallet.address};
    await blockchainObserver.subscribe('KeyAdded', filter, callback);
    const execution = await sdk.addKey(contractAddress, wallet.address, privateKey, paymentOptions);
    await execution.waitToBeMined();
    await blockchainObserver.fetchEvents(JSON.stringify({contractAddress, key: wallet.address}));
    expect(callback).to.have.been.calledWith({key: wallet.address.toLowerCase(), purpose: MANAGEMENT_KEY});
  });

  it('subscribe: shouldn`t emit AddKey on add another key', async () => {
    const callback = sinon.spy();
    const callback2 = sinon.spy();
    const paymentOptions = {...MESSAGE_DEFAULTS, gasToken: mockToken.address};

    const filter = {contractAddress, key: otherWallet.address};
    const filter2 = {contractAddress, key: otherWallet2.address};
    await blockchainObserver.subscribe('KeyAdded', filter,  callback);
    await blockchainObserver.subscribe('KeyAdded', filter2, callback2);

    const execution = await sdk.addKey(contractAddress, otherWallet.address, privateKey, paymentOptions);
    await execution.waitToBeMined();
    await blockchainObserver.fetchEvents(JSON.stringify(filter));

    expect(callback).to.have.been.calledWith({key: otherWallet.address.toLowerCase(), purpose: MANAGEMENT_KEY});
    expect(callback2).to.not.have.been.called;
  });

  it('subscribe: should emit RemoveKey on removeKey', async () => {
    const callback = sinon.spy();
    const paymentOptions = {...MESSAGE_DEFAULTS, gasToken: mockToken.address};
    const execution = await sdk.addKey(contractAddress, wallet.address, privateKey, paymentOptions);
    await execution.waitToBeMined();
    const filter = {contractAddress, key: wallet.address};
    await blockchainObserver.subscribe('KeyRemoved', filter, callback);
    const removeKeyPaymentOption = {...MESSAGE_DEFAULTS, gasToken: mockToken.address};
    const {waitToBeMined} = await sdk.removeKey(contractAddress, wallet.address, privateKey, removeKeyPaymentOption);
    await waitToBeMined();
    await blockchainObserver.fetchEvents(JSON.stringify(filter));
    expect(callback).to.have.been.calledWith({key: wallet.address.toLowerCase(), purpose: MANAGEMENT_KEY});
  });

  after(async () => {
    await relayer.stop();
    sdk.stop();
  });
});
