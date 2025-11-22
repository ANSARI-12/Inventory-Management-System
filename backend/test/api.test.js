const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../index"); // Assuming index.js exports the express app

describe("API Tests", () => {
  let token;

  before((done) => {
    // Register a user and get token
    request(app)
      .post("/api/register")
      .send({ username: "testuser", password: "testpass" })
      .end(() => {
        request(app)
          .post("/api/login")
          .send({ username: "testuser", password: "testpass" })
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            done();
          });
      });
  });

  describe("POST /api/products/import", () => {
    it("should import products from valid CSV file", (done) => {
      request(app)
        .post("/api/products/import")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", "uploads/products.csv")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property("added");
          expect(res.body).to.have.property("skipped");
          done();
        });
    });
  });
});
