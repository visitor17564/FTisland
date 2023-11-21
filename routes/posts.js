const express = require("express");
const router = express.Router();
const {posts, users} = require("../models");

//여행지 등록
router.post("/posts", async (req, res) =>{
    try {
        const { title, subtitle, region, contents } = req.body;
        if (!title || !subtitle || !region || !contents) {
            return res.status(400).json({
                "success": false,
                "message": "데이터형식이 올바르지 않습니다."
            });
        }
        const post = new posts({
            userId: 1,
            title,
            subtitle,
            region,
            contents,
            state: "true"

        })
        await post.save();
        return res.status(200).json({
            "success": true,
            "message": "관광지를 등록하였습니다."
        });
        
    }
    catch(err){
        return res.status(400).json({
            "success": false,
            "message": "관광지 등록에 실패하였습니다."
        });
    }
})

//여행지 목록 조회
router.get("/posts", async (req, res) => {
    try{
        const post = await posts.findAll({
            attributes: ["title","postId", "contents"],
            include: [{
                model: users,
                attributes: ["email"]
            }],
            order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({
            success: true, 
            "data": post
        });
    }
    catch(err){
        return res.status(500).json({
            "success": false, 
            "message": "관광지를 조회할 수 없습니다."
        });
    }
});

//여행지 상세 조회
router.get("/posts/:postId", async (req, res) => {
    try{
        const postId = req.params.postId
        const post = await posts.findOne({
            where: { postId },
            attributes: ["postId","userId","title","subtitle","region","contents","state"],
            include: [{
                model: users,
                attributes: ["email"]
            }]
        });
        if (!post.dataValues) {
            return res.status(500).json({
                success: false,
                message: "관광지 조회에 실패 하였습니다."
            });
        }
        return res.status(200).json({
            success: true,
            data: post
        });
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message: "서버에러."
        });
    }
});

//관광지 수정
router.put("/posts/:postId", async (req, res) => {
    try{
        const postId = req.params.postId;
        const { title, subtitle, region, contents } = req.body;
        if (!title || !subtitle || !region || !contents) {
            return res.status(400).json({
                "success": false,
                "message": "데이터형식이 올바르지 않습니다."
            });
        }
        const post = await posts.findOne({ postId });

        if (!post.dataValues) {
            return res.status(401).json({
                success: false,
                message: "관광지 정보를 수정할 권한이 존재하지 않습니다."
            });
        }
        const updatedAt = new Date();

        post.update({
            title, subtitle, region, contents, updatedAt
        },
        {
            where : { postId }
        }).then(() => {
            return res.status(200).json({
                success: true,
                message: "관광지 정보를 수정하였습니다." 
            });
        });
    }   
    catch(err){
        return res.status(500).json({
            success: false,
            message: "서버 오류."
        });
    }
});

//관광지 삭제
router.delete("/posts/:postId", async (req, res) => {
    try{
        const postId = req.params.postId;
        const post = await posts.findOne({ postId });

        if (!post.dataValues) {
            return res.status(500).json({
                success: false,
                message: "관광지 조회에 실패 하였습니다."
            });
        }
        // if (post.dataValues.postId !== res.locals.posts.dataValues.postId) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "관광지를 삭제할 권한이 존재하지 않습니다."
        //     });
        // } 지금 JWT 토큰이 존재하지 않기 때문에 검증을 하지 못한다.
        post.destroy({
            where : { postId }
        }).then(() => {
            return res.status(200).json({
                success: false,
                message: "관광지 정보를 삭제하였습니다."
            });
        })
    }
    catch(err){
        console.log(err);
        return res.status(400).json({
            success:false,
            message: "서버오류."
        });
    }
});



module.exports = router;