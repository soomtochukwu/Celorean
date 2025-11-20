import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Celorean Security", function () {
  let celorean: any;
  let owner: any;
  let lecturer: any;
  let student: any;
  let other: any;

  beforeEach(async function () {
    [owner, lecturer, student, other] = await ethers.getSigners();

    const Celorean = await ethers.getContractFactory("Celorean");
    celorean = await upgrades.deployProxy(Celorean, ["Celorean", "CEL", owner.address], {
      initializer: "initialize",
      kind: "uups",
    });
    await celorean.waitForDeployment();

    // Add lecturer
    await celorean.connect(owner).employLecturer(lecturer.address, 100);
  });

  it("Should allow lecturer to admit student", async function () {
    await expect(celorean.connect(lecturer).admitStudent(student.address, 100))
      .to.emit(celorean, "StudentAdmitted")
      .withArgs(student.address, 100);

    expect(await celorean.isStudent(student.address)).to.be.true;
  });

  it("Should NOT allow random user to admit student", async function () {
    await expect(
      celorean.connect(other).admitStudent(student.address, 100)
    ).to.be.revertedWith("Only lecturer can perform this action");
  });

  it("Should allow owner (if also lecturer) to admit student", async function () {
      // Owner is not lecturer by default in this setup unless added, 
      // but let's check if owner can add themselves or if the contract logic allows owner override.
      // The modifier is `onlyLecturer`.
      
      await celorean.connect(owner).employLecturer(owner.address, 100);
      
      await expect(celorean.connect(owner).admitStudent(student.address, 100))
      .to.emit(celorean, "StudentAdmitted")
      .withArgs(student.address, 100);
  });
});
