/* eslint no-unused-vars: 0 */
/* eslint eqeqeq: 0 */

const { expect, assert } = require('chai');
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  ether,
  time
} = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { ZERO, ONE, getMockTokenPrepared } = require('./utils/common');

const Router = artifacts.require('Router');
const IERC20 = artifacts.require('IERC20');
const IUniswapV2Router02 = artifacts.require('IUniswapV2Router02');

const MockContract = artifacts.require("MockContract");

contract('Router', (accounts) => {

  const owner = accounts[0];
  const teamAddress = accounts[1];
  const bob = accounts[2];

  var router;
  var mockRouter;
  var mockPair;
  var mockToken;

  beforeEach(async () => {
    router = await Router.new(teamAddress);
    mockRouter = await MockContract.new();
    mockPair = await MockContract.new();
    mockToken = await MockContract.new();
    await router.configure(
      mockRouter.address,
      mockToken.address,
      mockPair.address
    );
  });

  it('should configure properly', async () => {
    expect(await router.uniswapRouter()).to.be.equal(mockRouter.address);
    expect(await router.teamAddress()).to.be.equal(teamAddress);
    expect(await router.EURxb()).to.be.equal(mockToken.address);
    expect(await router.pairAddress()).to.be.equal(mockPair.address);
  });

  it('should revert if already closed', async () => {
    await router.closeContract();
    await expectRevert(router.closeContract(), "closed");
  });

  const setupMockToken = async (balanceMock, transferStatusMock) => {
    const balanceOfCalldata = (await IERC20.at(mockToken.address)).contract
      .methods.balanceOf(ZERO_ADDRESS).encodeABI();
    const transferCalldata = (await IERC20.at(mockToken.address)).contract
      .methods.transfer(ZERO_ADDRESS, ZERO).encodeABI();
    await mockToken.givenMethodReturnUint(balanceOfCalldata, balanceMock);
    await mockToken.givenMethodReturnBool(transferCalldata, transferStatusMock);
  };

  it('should revert if transfer failed', async () => {
    await setupMockToken(ether('10'), false);
    await expectRevert(router.closeContract(), "!transfer");
  });

  it('should close even if balance is zero', async () => {
    await setupMockToken(ZERO, true);
    await router.closeContract();
    expect(await router.isClosedContract()).to.be.equal(true);
  });

  it('should close even if balance is greater than zero', async () => {
    await setupMockToken(ether('10'), true);
    await router.closeContract();
    expect(await router.isClosedContract()).to.be.equal(true);
  });

  it('should revert if contract closed when adding liquidity', async () => {
    await setupMockToken(ether('10'), true);
    await router.closeContract();
    await expectRevert(router.addLiquidity(mockToken.address, ether('10')), "closed");
  });

  const setUpReserves = async () => {
    
  };

  it('should revert adding liquidity of balance eur gt 1 eurxb token', async () => {
    await setupMockToken(ether('10'), true);
    await expectRevert(router.addLiquidity(mockToken.address, ether('10')), "emptyEURxbBalance");
  });
});