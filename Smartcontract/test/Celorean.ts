import { expect } from "chai";
// @ts-ignore
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Celorean Contract", function () {
  async function deployCeloreanFixture() {
    const [owner, lecturer, student1, student2, student3] =
      await ethers.getSigners();

    const Celorean = await ethers.getContractFactory("Celorean");
    const celorean = await Celorean.deploy("Celorean NFT", "CEL");

    return { celorean, owner, lecturer, student1, student2, student3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { celorean, owner } = await loadFixture(deployCeloreanFixture);
      expect(await celorean.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      const { celorean } = await loadFixture(deployCeloreanFixture);
      expect(await celorean.name()).to.equal("Celorean NFT");
      expect(await celorean.symbol()).to.equal("CEL");
    });
  });

  describe("Lecturer Management", function () {
    it("Should allow admin to employ a lecturer", async function () {
      const { celorean, owner, lecturer } = await loadFixture(
        deployCeloreanFixture
      );

      await expect(
        celorean.connect(owner).employ_Lecturer(lecturer.address, 100)
        // @ts-ignore
      ).to.not.be.reverted;
    });

    it("Should prevent non-admin from employing a lecturer", async function () {
      const { celorean, lecturer, student1 } = await loadFixture(
        deployCeloreanFixture
      );

      await expect(
        celorean.connect(student1).employ_Lecturer(lecturer.address, 100)
        // @ts-ignore
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should prevent employing the same lecturer twice", async function () {
      const { celorean, owner, lecturer } = await loadFixture(
        deployCeloreanFixture
      );

      await celorean.connect(owner).employ_Lecturer(lecturer.address, 100);

      await expect(
        celorean.connect(owner).employ_Lecturer(lecturer.address, 50)
        // @ts-ignore
      ).to.be.revertedWith("Lecturer already exists");
    });
  });

  describe("Student Management", function () {
    it("Should allow admin to admit a student", async function () {
      const { celorean, owner, student1 } = await loadFixture(
        deployCeloreanFixture
      );

      await expect(celorean.connect(owner).admit_student(student1.address, 50))
        // @ts-ignore
        .to.not.be.reverted;
    });

    it("Should prevent non-admin from admitting a student", async function () {
      const { celorean, lecturer, student1 } = await loadFixture(
        deployCeloreanFixture
      );

      await expect(
        celorean.connect(lecturer).admit_student(student1.address, 50)
        // @ts-ignore
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should prevent admitting the same student twice", async function () {
      const { celorean, owner, student1 } = await loadFixture(
        deployCeloreanFixture
      );

      await celorean.connect(owner).admit_student(student1.address, 50);

      await expect(
        celorean.connect(owner).admit_student(student1.address, 30)
        // @ts-ignore
      ).to.be.revertedWith("student already exists");
    });

    it("Should return list of students", async function () {
      const { celorean, owner, student1, student2 } = await loadFixture(
        deployCeloreanFixture
      );

      await celorean.connect(owner).admit_student(student1.address, 50);
      await celorean.connect(owner).admit_student(student2.address, 50);

      const students = await celorean.getListOfStudents();
      expect(students).to.include(student1.address);
      expect(students).to.include(student2.address);
      expect(students.length).to.equal(2);
    });
  });

  describe("Course Management", function () {
    it("Should allow anyone to create a course", async function () {
      const { celorean, lecturer } = await loadFixture(deployCeloreanFixture);

      await expect(
        celorean
          .connect(lecturer)
          .createCourse("Mathematics", 30, "Basic math course")
      )
        // @ts-ignore
        .to.emit(celorean, "CourseCreated")
        .withArgs(1, "Mathematics", lecturer.address, 30);
    });

    it("Should prevent creating duplicate course names", async function () {
      const { celorean, lecturer } = await loadFixture(deployCeloreanFixture);

      await celorean
        .connect(lecturer)
        .createCourse("Mathematics", 30, "Basic math course");

      await expect(
        celorean
          .connect(lecturer)
          .createCourse("Mathematics", 25, "Advanced math course")
        // @ts-ignore
      ).to.be.revertedWith("Course with this name already exists");
    });

    it("Should return all course names", async function () {
      const { celorean, lecturer } = await loadFixture(deployCeloreanFixture);

      await celorean
        .connect(lecturer)
        .createCourse("Mathematics", 30, "Basic math course");
      await celorean
        .connect(lecturer)
        .createCourse("Physics", 25, "Basic physics course");

      const courseNames = await celorean.getAllCourseNames();
      expect(courseNames).to.include("Mathematics");
      expect(courseNames).to.include("Physics");
      expect(courseNames.length).to.equal(2);
    });

    it("Should return all course details", async function () {
      const { celorean, lecturer } = await loadFixture(deployCeloreanFixture);

      await celorean
        .connect(lecturer)
        .createCourse("Mathematics", 30, "Basic math course");

      const [names, lecturers, capacities, enrolledStudents, descriptions] =
        await celorean.getAllCourses();

      expect(names[0]).to.equal("Mathematics");
      expect(lecturers[0]).to.equal(lecturer.address);
      expect(capacities[0]).to.equal(30);
      expect(enrolledStudents[0]).to.equal(0);
      expect(descriptions[0]).to.equal("Basic math course");
    });
  });

  describe("Course Registration", function () {
    async function setupCourseFixture() {
      const fixture = await loadFixture(deployCeloreanFixture);
      const { celorean, owner, lecturer, student1, student2 } = fixture;

      // Setup lecturer and students
      await celorean.connect(owner).employ_Lecturer(lecturer.address, 100);
      await celorean.connect(owner).admit_student(student1.address, 50);
      await celorean.connect(owner).admit_student(student2.address, 50);

      // Create a course
      await celorean
        .connect(lecturer)
        .createCourse("Mathematics", 2, "Basic math course");

      return { ...fixture };
    }

    it("Should allow student to register for a course", async function () {
      const { celorean, student1 } = await setupCourseFixture();

      await expect(celorean.connect(student1).registerForCourse("Mathematics"))
        // @ts-ignore

        .to.emit(celorean, "StudentRegistered")
        .withArgs("Mathematics", student1.address);
    });

    it("Should prevent non-student from registering", async function () {
      const { celorean, lecturer } = await setupCourseFixture();

      await expect(
        celorean.connect(lecturer).registerForCourse("Mathematics")
        // @ts-ignore
      ).to.be.revertedWith("Only student can perform this action");
    });

    it("Should prevent registration for non-existent course", async function () {
      const { celorean, student1 } = await setupCourseFixture();

      await expect(
        celorean.connect(student1).registerForCourse("Chemistry")
        // @ts-ignore
      ).to.be.revertedWith("Course not found");
    });

    it("Should prevent duplicate registration", async function () {
      const { celorean, student1 } = await setupCourseFixture();

      await celorean.connect(student1).registerForCourse("Mathematics");

      await expect(
        celorean.connect(student1).registerForCourse("Mathematics")
        // @ts-ignore
      ).to.be.revertedWith("Already registered");
    });

    it("Should prevent registration when course is full", async function () {
      const { celorean, student1, student2, student3, owner } =
        await setupCourseFixture();

      // Admit third student
      await celorean.connect(owner).admit_student(student3.address, 50);

      // Fill up the course (capacity is 2)
      await celorean.connect(student1).registerForCourse("Mathematics");
      await celorean.connect(student2).registerForCourse("Mathematics");

      await expect(
        celorean.connect(student3).registerForCourse("Mathematics")
        // @ts-ignore
      ).to.be.revertedWith("Course is full");
    });

    it("Should track courses registered by student", async function () {
      const { celorean, lecturer, student1 } = await setupCourseFixture();

      // Create another course
      await celorean
        .connect(lecturer)
        .createCourse("Physics", 5, "Basic physics course");

      await celorean.connect(student1).registerForCourse("Mathematics");
      await celorean.connect(student1).registerForCourse("Physics");

      const registeredCourses = await celorean.getCoursesRegisteredByStudent(
        student1.address
      );
      expect(registeredCourses.length).to.equal(2);
    });

    it("Should return total registered courses for student", async function () {
      const { celorean, lecturer, student1 } = await setupCourseFixture();

      await celorean
        .connect(lecturer)
        .createCourse("Physics", 5, "Basic physics course");

      await celorean.connect(student1).registerForCourse("Mathematics");
      await celorean.connect(student1).registerForCourse("Physics");

      const totalCourses = await celorean
        .connect(student1)
        .getTotalRegisteredCourses();
      expect(totalCourses).to.equal(2);
    });
  });

  describe("Class Sessions", function () {
    async function setupSessionFixture() {
      const fixture = await loadFixture(deployCeloreanFixture);
      const { celorean, owner, lecturer, student1 } = fixture;

      // Setup lecturer and student
      await celorean.connect(owner).employ_Lecturer(lecturer.address, 100);
      await celorean.connect(owner).admit_student(student1.address, 50);

      // Create a course and register student
      await celorean
        .connect(lecturer)
        .createCourse("Mathematics", 10, "Basic math course");
      await celorean.connect(student1).registerForCourse("Mathematics");

      return { ...fixture };
    }

    it("Should allow lecturer to create a class session", async function () {
      const { celorean, lecturer } = await setupSessionFixture();

      const timestamp = Math.floor(Date.now() / 1000);

      await expect(
        celorean.connect(lecturer).createClassSession(1, timestamp)
        // @ts-ignore
      ).to.emit(celorean, "ClassSessionCreated");
    });

    it("Should prevent non-lecturer from creating session", async function () {
      const { celorean, student1 } = await setupSessionFixture();

      const timestamp = Math.floor(Date.now() / 1000);

      await expect(
        celorean.connect(student1).createClassSession(1, timestamp)
        // @ts-ignore
      ).to.be.revertedWith("Only lecturer can perform this action");
    });

    it("Should prevent creating session for invalid course", async function () {
      const { celorean, lecturer } = await setupSessionFixture();

      const timestamp = Math.floor(Date.now() / 1000);

      await expect(
        celorean.connect(lecturer).createClassSession(999, timestamp)
        // @ts-ignore
      ).to.be.revertedWith("Invalid course ID");
    });

    it("Should mint NFT to lecturer when creating session", async function () {
      const { celorean, lecturer } = await setupSessionFixture();

      const timestamp = Math.floor(Date.now() / 1000);
      const initialBalance = await celorean.balanceOf(lecturer.address);

      await celorean.connect(lecturer).createClassSession(1, timestamp);

      const finalBalance = await celorean.balanceOf(lecturer.address);
      expect(finalBalance).to.equal(initialBalance + 1n);
    });

    it("Should return session IDs for lecturer", async function () {
      const { celorean, lecturer } = await setupSessionFixture();

      const timestamp = Math.floor(Date.now() / 1000);
      await celorean.connect(lecturer).createClassSession(1, timestamp);

      const sessionIds = await celorean
        .connect(lecturer)
        .getSessionIdsForLecturer();
      expect(sessionIds.length).to.be.greaterThan(0);
    });
  });

  describe("Attendance Tracking", function () {
    async function setupAttendanceFixture() {
      const fixture = await loadFixture(deployCeloreanFixture);
      const { celorean, owner, lecturer, student1 } = fixture;

      // Setup lecturer and student
      await celorean.connect(owner).employ_Lecturer(lecturer.address, 100);
      await celorean.connect(owner).admit_student(student1.address, 50);

      // Create a course and register student
      await celorean
        .connect(lecturer)
        .createCourse("Mathematics", 10, "Basic math course");
      await celorean.connect(student1).registerForCourse("Mathematics");

      // Create a class session
      const timestamp = Math.floor(Date.now() / 1000);
      await celorean.connect(lecturer).createClassSession(1, timestamp);

      // Get the session ID
      const sessionIds = await celorean
        .connect(lecturer)
        .getSessionIdsForLecturer();
      const sessionId = sessionIds[0];

      return { ...fixture, sessionId };
    }

    it("Should allow student to mark attendance", async function () {
      const { celorean, student1, sessionId } = await setupAttendanceFixture();

      await expect(celorean.connect(student1).markAttendance(sessionId))
        // @ts-ignore

        .to.emit(celorean, "AttendanceMarked")
        .withArgs(sessionId, student1.address);
    });

    it("Should prevent non-student from marking attendance", async function () {
      const { celorean, lecturer, sessionId } = await setupAttendanceFixture();

      await expect(
        celorean.connect(lecturer).markAttendance(sessionId)
        // @ts-ignore
      ).to.be.revertedWith("Only student can perform this action");
    });

    it("Should prevent marking attendance for invalid session", async function () {
      const { celorean, student1 } = await setupAttendanceFixture();

      await expect(
        celorean.connect(student1).markAttendance(999)
        // @ts-ignore
      ).to.be.revertedWith("Session not found");
    });

    it("Should prevent duplicate attendance marking", async function () {
      const { celorean, student1, sessionId } = await setupAttendanceFixture();

      await celorean.connect(student1).markAttendance(sessionId);

      await expect(
        celorean.connect(student1).markAttendance(sessionId)
        // @ts-ignore
      ).to.be.revertedWith("Attendance already marked");
    });

    it("Should calculate attendance percentage correctly", async function () {
      const { celorean, lecturer, student1, sessionId } =
        await setupAttendanceFixture();

      // Mark attendance for the session
      await celorean.connect(student1).markAttendance(sessionId);

      // Create another session
      const timestamp2 = Math.floor(Date.now() / 1000) + 3600;
      await celorean.connect(lecturer).createClassSession(1, timestamp2);

      // Get attendance percentage (should be 50% since student attended 1 out of 2 sessions)
      const percentage = await celorean
        .connect(student1)
        .calculateAttendancePercentage();
      expect(percentage).to.equal(50);
    });
  });

  describe("Access Control", function () {
    it("Should allow ownership transfer", async function () {
      const { celorean, owner, lecturer } = await loadFixture(
        deployCeloreanFixture
      );

      await celorean.connect(owner).transferOwnership(lecturer.address);
      expect(await celorean.owner()).to.equal(lecturer.address);
    });

    it("Should prevent unauthorized ownership transfer", async function () {
      const { celorean, lecturer, student1 } = await loadFixture(
        deployCeloreanFixture
      );

      await expect(
        celorean.connect(student1).transferOwnership(lecturer.address)
        // @ts-ignore
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero attendance percentage when no sessions exist", async function () {
      const { celorean, owner, student1 } = await loadFixture(
        deployCeloreanFixture
      );

      await celorean.connect(owner).admit_student(student1.address, 50);

      const percentage = await celorean
        .connect(student1)
        .calculateAttendancePercentage();
      expect(percentage).to.equal(0);
    });

    it("Should handle empty course list", async function () {
      const { celorean } = await loadFixture(deployCeloreanFixture);

      const courseNames = await celorean.getAllCourseNames();
      expect(courseNames.length).to.equal(0);
    });

    it("Should handle empty student list initially", async function () {
      const { celorean } = await loadFixture(deployCeloreanFixture);

      const students = await celorean.getListOfStudents();
      expect(students.length).to.equal(0);
    });
  });
});
