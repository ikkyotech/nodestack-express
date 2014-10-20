"use strict";

var Lab = require("lab"),
    expect = Lab.expect,
    preparePorts = require("../../lib/util/preparePorts"),
    test = Lab.test,
    experiment = Lab.experiment;

experiment("Preparing ports", function () {
    test("simple http number", function (done) {
        expect(preparePorts(8888)).to.deep.equal([{ http: {listen: "8888", redirect: "8888" }}]);
        done();
    });
    test("simple http string", function (done) {
        expect(preparePorts("8888")).to.deep.equal([{ http: {listen: "8888", redirect: "8888" }}]);
        done();
    });
    test("simple https", function (done) {
        expect(preparePorts(443)).to.deep.equal([{ https: {listen: "443", redirect: "443" }}]);
        done();
    });
    test("simple https & http", function (done) {
        expect(preparePorts([443, 80])).to.deep.equal([
            { https: {listen: "443", redirect: "443" }},
            { http: {listen: "80", redirect: "80" }}
        ]);
        done();
    });
    test("simple https & http object", function (done) {
        expect(preparePorts([{
            https: "443"
        }, {
            http: "80"
        }])).to.deep.equal([
            { https: {listen: "443", redirect: "443" }},
            { http: {listen: "80", redirect: "80" }}
        ]);
        done();
    });
    test("slightly convoluted https & http object", function (done) {
        expect(preparePorts([{
            https: "80"
        }, {
            http: "443"
        }])).to.deep.equal([
            { https: {listen: "80", redirect: "80" }},
            { http: {listen: "443", redirect: "443" }}
        ]);
        done();
    });
    test("multiple paths as array", function (done) {
        expect(preparePorts({
            https: ["80", "8080"]
        })).to.deep.equal([
            { https: {listen: "80", redirect: "8080" }}
        ]);
        done();
    });
    test("multiple paths as object", function (done) {
        expect(preparePorts({
            https: {
                listen: "80",
                redirect: "8080"
            }
        })).to.deep.equal([
            { https: {listen: "80", redirect: "8080" }}
        ]);
        done();
    });
});