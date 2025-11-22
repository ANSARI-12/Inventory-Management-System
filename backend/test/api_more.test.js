const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../index"); // Assuming index.js exports the express app

describe("Additional API Tests", () => {
  let token;
  let createdProductId;

  before((done) => {
    // Register and login user to get token
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

  it("should create a new product", (done) => {
    request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Product",
        unit: "Piece",
        category: "Electronics",
        brand: "BrandTest",
        stock: 20,
        status: "In Stock",
        image: "",
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("id");
        createdProductId = res.body.id;
        done();
      });
  });

  it("should update the created product", (done) => {
    request(app)
      .put(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Product Updated",
        unit: "Piece",
        category: "Electronics",
        brand: "BrandTest",
        stock: 15,
        status: "In Stock",
        image: "",
      })
      .expect(200, done);
  });

  it("should fetch history for a product", (done) => {
    request(app)
      .get(`/api/products/${createdProductId}/history`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  it("should export products as CSV", (done) => {
    request(app)
      .get("/api/products/export")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /text\/csv/)
      .expect(200, done);
  });

  it("should delete the created product", (done) => {
    request(app)
      .delete(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200, done);
  });

  it("should return 404 for updating non-existing product", (done) => {
    request(app)
      .put("/api/products/9999999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Non Existing",
        unit: "Piece",
        category: "None",
        brand: "None",
        stock: 0,
        status: "Out of Stock",
        image: "",
      })
      .expect(404, done);
  });
});
