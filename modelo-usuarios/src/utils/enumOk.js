const enumOk = (gender) => {
  const enumGender = ['hombre', 'mujer'];
  if (enumGender.includes(gender)) {
    return { check: true, gender };
  } else {
    return {
      check: false,
    };
  }
};
const enumOkCate = (categoria) => {
  const enumcate = ["limpieza","alimentacion","juguetes","textil","electronica","drogueria"];
  if (enumcate.includes(categoria)) {
    return { check: true, categoria };
  } else {
    return {
      check: false,
    };
  }
};

module.exports ={enumOk,enumOkCate}
