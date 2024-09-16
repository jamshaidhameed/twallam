class MediaRepo {
  constructor() {}

  async mediaModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [media] = await promisePool.query(`UPDATE Media set MediaLink = ?, updated_at = now() where id = ?`, [body.MediaLink, body.id]);
        resolve(media);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new MediaRepo();
