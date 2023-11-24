function errorHandler(errorName, req, res) {
  switch (errName) {
    // auth.js 에러들
    case "ExistingEmail":
      return res.status(409).send({
        errorMessage: "해당 이메일은 이미 사용 중입니다."
      });
    case "UnknownEmail":
      return res.status(404).send({
        errorMessage: "해당 이메일을 가진 유저가 존재하지 않습니다."
      });
    case "UnCorrectPassword":
      return res.status(401).send({
        errorMessage: "비밀번호가 일치하지 않습니다."
      });

    // myPage.js 에러들
    case "UnknownUser":
      return res.status(404).send({
        errorMessage: "사용자정보가 없습니다."
      });

    // post.js, comment.js 에러들
    case "Forbidden":
      return res.status(403).send({
        errorMessage: "권한이 없습니다."
      });
    case "UnknownPost":
      return res.status(404).send({
        errorMessage: "해당 게시글이 존재하지 않습니다."
      });

    // follows.js 에러들
    case "NoneFollow":
      return res.status(404).send({
        errorMessage: "팔로우하는 사람이 없습니다."
      });
    case "NoneFollowed":
      return res.status(404).send({
        errorMessage: "팔로워가 없습니다."
      });
    case "AlreadyFollowed":
      return res.status(409).send({
        errorMessage: "이미 팔로우중입니다."
      });

    // likes 에러들(post, comment)
    case "NoneFollowPost":
      return res.status(404).send({
        errorMessage: "좋아하는 게시글이 없습니다."
      });
    case "NoneFollowComment":
      return res.status(404).send({
        errorMessage: "좋아하는 댓글이 없습니다."
      });
    case "NonePostLiker":
      return res.status(404).send({
        errorMessage: "게시글을 좋아하는 사람이 없습니다."
      });
    case "NoneCommentLiker":
      return res.status(404).send({
        errorMessage: "게시글을 좋아하는 사람이 없습니다."
      });
    case "AlreadyLiked":
      return res.status(409).send({
        errorMessage: "이미 좋아합니다."
      });

    default:
      return res.status(500).send({
        errorMessage: "알 수 없는 에러 발생, 관리자에게 문의하세요"
      });
  }
}
