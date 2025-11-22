const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../index");

describe("API Edge Case Tests", () => {
  let token;

  before((done) => {
    request(app)
      .post("/api/register")
      .send({ username: "edgecaseuser", password: "edgepass" })
      .end(() => {
        request(app)
          .post("/api/login")
          .send({ username: "edgecaseuser", password: "edgepass" })
          .end((err, res) => {
            if (err) return done(err);
            token = res.body.token;
            done();
          });
      });
  });

  it("should reject access without auth token", (done) => {
    request(app).get("/api/products/search").expect(401, done);
  });

  it("should return 400 for register with missing fields", (done) => {
    request(app).post("/api/register").send({ username: "" }).expect(400, done);
  });

  it("should return 400 for login with missing fields", (done) => {
    request(app)
      .post("/api/login")
      .send({ password: "nopassword" })
      .expect(400, done);
  });

  it("should reject update with invalid product id", (done) => {
    request(app)
      .put("/api/products/invalid")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Invalid Prod",
        unit: "Piece",
        category: "Invalid",
        brand: "Invalid",
        stock: 10,
        status: "In Stock",
        image: "",
      })
      .expect(400, done); // Changed to expect 400 Bad Request
  });

  it("should delete all products", (done) => {
    request(app)
      .delete("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.have.property("message", "All products deleted");
        done(err);
      });
  });

  it("should reject import with no file uploaded", (done) => {
    request(app)
      .post("/api/products/import")
      .set("Authorization", `Bearer ${token}`)
      .expect(400, done);
  });
});
