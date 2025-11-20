import { expect } from "chai";
// @ts-ignore
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Student Rewards", function () {
  async function deployCeloreanFixture() {
    const [owner, lecturer, student1, student2] = await ethers.getSigners();

    const Celorean = await ethers.getContractFactory("Celorean");
    const celorean = await upgrades.deployProxy(Celorean, ["Celorean NFT", "CEL", owner.address]);
    await celorean.waitForDeployment();

    // Setup: Employ lecturer and admit student
    await celorean.connect(owner).employLecturer(lecturer.address, 100);
    await celorean.connect(lecturer).admitStudent(student1.address, 50);

    return { celorean, owner, lecturer, student1, student2 };
  }

  it("Should allow lecturer to reward a student", async function () {
    const { celorean, lecturer, student1 } = await loadFixture(deployCeloreanFixture);

    await expect(celorean.connect(lecturer).rewardStudent(student1.address, 20))
      .to.emit(celorean, "StudentTokenUpdated")
      .withArgs(student1.address, 70); // 50 (initial) + 20 (reward)
  });

  it("Should prevent non-lecturer from rewarding a student", async function () {
    const { celorean, student1, student2 } = await loadFixture(deployCeloreanFixture);

    await expect(
      celorean.connect(student1).rewardStudent(student1.address, 10)
    ).to.be.revertedWith("Only lecturer can perform this action");
  });

  it("Should prevent rewarding a non-student", async function () {
    const { celorean, lecturer, student2 } = await loadFixture(deployCeloreanFixture);

    await expect(
      celorean.connect(lecturer).rewardStudent(student2.address, 10)
    ).to.be.revertedWith("Not a student");
  });

  it("Should accumulate tokens correctly", async function () {
    const { celorean, lecturer, student1 } = await loadFixture(deployCeloreanFixture);

    await celorean.connect(lecturer).rewardStudent(student1.address, 10);
    await celorean.connect(lecturer).rewardStudent(student1.address, 20);

    // We can't directly read studentTokens from Celorean if it's not public or no getter, 
    // but StudentModule has public studentTokens mapping.
    // Let's verify via the event or getter if available.
    // The mapping is public: mapping(address => uint256) public studentTokens;
    
    expect(await celorean.studentTokens(student1.address)).to.equal(80); // 50 + 10 + 20
  });
});
