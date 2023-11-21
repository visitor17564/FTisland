const express = require("express");
const router = express.Router();
const {posts} = require("../models");//뒤에 인덱스는 생략 가능 기본값

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
        console.log(err);
        return res.status(400).json({
            "success": false,
            "message": "관광지 등록에 실패하였습니다.",
            "holy": err
        });
    }
})



module.exports = router;