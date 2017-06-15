import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import Course from './modals/Course.js'
import User from './modals/User.js'
import Selection from './modals/StudentCourseSelection.js'
import Evaluate from './modals/Evaluate.js'
import ExportEvaluate from './modals/ExportEvaluate.js'
import index from './routes/index'
import users from './routes/users'

import check_api_token from './utils/check_api_token.js'

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/CourseManagementSystem')
mongoose.set('debug', true);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/test', function(req, res) {
  res.json({
    status: 200
  });
});

app.use('/', (req, res, next) => {
  console.log('不使用拦截器')
  console.log(req.originalUrl)
  if (req.originalUrl !== '/user/login') {
    console.log('使用拦截器')
    check_api_token(req, res, next)
  } else {
    next()
  }
})

app.use('/user/login', async function(req, res) {
  try {
    const user = await User.findOne({username: req.body.username})
    if (!user) {
      res.json({ success: false, message: '认证失败，用户名找不到' });
    } else if (user.password !== req.body.password) {
      res.json({ success: false, message: '认证失败，密码错误' });
    } else {
      console.log(user)
      var token = jwt.sign(user, 'shhhhh');
      res.json({
          success: true,
          message: '登录成功！',
          user,
          token
      });
    }
  } catch (error) {
    console.log(error)
  }
});

app.use('/user/changepw', async function(req, res) {
  try {
    const _user = req.body.user
    const user = await User.findOne({ _id: _user._id })
    if (!user) {
      res.json({ success: false, message: '用户名找不到' });
    } else if (user.password !== req.body.password) {
      res.json({ success: false, message: '密码错误' });
    } else {
      user.password = req.body.newpassword
      await user.save()
      res.json({
          success: true,
          message: '修改密码成功！'
      });
    }
  } catch (error) {
    res.json({
        success: false,
        message: JSON.stringify(error)
    });
  }
});

// 获取课程列表
app.post('/course/list', async function(req, res) {
  try {
    console.log(req.body)
    let courses = []
    if (req.body.keyword) {
      const reg = new RegExp(req.body.keyword, 'i')
      courses = await Course.find({
        $or: [
          {
            name: {
              $regex: reg
            },
          }
        ]
      }).populate('teacher');
      console.log(courses)
    } else {
      courses = await Course.find({}).populate('teacher');
    }
    const selections = await Selection.find({'student': req.body.user._id})
    for(let i = 0; i < selections.length; i ++ ) {
      for(let j = 0; j < courses.length; j ++ ) {
        if (selections[i].course.toString() === courses[j]._id.toString()) {
          courses[j].select = true
        }
      }
    }
    await res.json({ status: 200, courses })
  } catch (error) {
    console.log(error)
  }
});

// 添加课程
app.post('/course/add', function(req, res) {
  Course.create(req.body, function(err){
    if(err) {
        console.log(err);
        res.json({
          status: 401,
          message: '添加课程失败！'
        })
    } else {
        console.log('save ok');
        res.json({
          status: 200,
          message: '添加课程成功！'
        })
    }
  });
});

// 批量添加用户
app.post('/users/batchadd', async function(req, res) {
  console.log(req.body)
  try {
    await User.create(req.body.list)
    await res.json({
      success: true,
      message: '添加用户成功！'
    })
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      message: '添加用户失败！'
    })
  }
});

// 选课
app.post('/course/select', function(req, res) {

  var course = req.body.course
  var student = req.body.user._id
  if (!student || !course) {
    res.json({ status: 401, message: '参数错误！' })
    return
  }

  Selection.findOne({course, student}).then(selection => {
    if (!selection) {
      Selection.create({course, student}, function(err){
        if(err) {
            console.log(err);
            res.json({
              status: 401,
              message: '选课失败！'
            })
        } else {
            res.json({
              status: 200,
              message: '选课成功！'
            })
        }
      });
    } else {
      Selection.remove(selection, function(error){
        if(error) {
          console.log(error);
          res.json({ status: 401, message: '退课失败' })
        } else {
          console.log('delete ok!');
          res.json({ status: 200, message: '退课成功' })
        }
      })
    }
  })
  // Selection.create(req.body, function(err){
  //   if(err) {
  //       console.log(err);
  //       res.json({
  //         status: 401,
  //         message: '选课失败！'
  //       })
  //   } else {
  //       console.log('save ok');
  //       res.json({
  //         status: 200,
  //         message: '选课成功！'
  //       })
  //   }
  // });

  // Course.findById(courseId, function(err, course) {
  //   const index = course.students.indexOf(studentId)
  //   if (index !== -1) { // 如果列表中已存在，则取消选课
  //     course.students.splice(index, 1)
  //   } else {     // 如果列表中不存在，则添加选课
  //     course.students.push(studentId)
  //   }
  //   course.save(function(err, course){
  //     Course.fetch((err, courses) => {
  //       if (err) { console.log(err) }
  //       res.json({
  //         status: 200,
  //         message: index !== -1 ? '退课成功！' : '选课成功！',
  //         courses
  //       });
  //     })
  //   })
  // })

});

// 删除课程
app.delete('/course/del', function(req, res) {
  // 删除记录
  var id = req.body.id
  if (!id) {
    res.json({ status: 401, message: '删除失败,id不存在！' })
    return
  }
  Course.findById(id, function(err, data) {
    Course.remove(data, function(error){
      if(error) {
        console.log(error);
        res.json({ status: 401, message: '删除失败' })
      } else {
        console.log('delete ok!');
        res.json({ status: 200, message: '删除成功' })
      }
    });
  })
});

// 获取用户列表
app.use('/users/list',async function(req, res) {
  const params = req.body.params
  
  try {
    let users
    let username = ''
    let nickName = ''
    if (req.body.params.username) {
      username = new RegExp(req.body.params.username, 'i')
    }
    if (req.body.params.nickName) {
      nickName = new RegExp(req.body.params.nickName, 'i')
    }
    users = await User.find({
      $or: [
        {
          username: {
            $regex: username
          },
          nickName: {
            $regex: nickName
          },
        }
      ]
    })
    // } else {
    //   users = await User.find({})
    // }
    res.json({ success: true, users });
  } catch (error) {
    console.log(error)
  }
});

// 添加用户
app.post('/users/add', function(req, res) {
  User.create(req.body, function(err){
    if(err) {
        console.log(err);
        res.json({
          status: 401,
          message: '添加课程失败！'
        })
    } else {
        console.log('save ok');
        res.json({
          status: 200,
          message: '添加课程成功！'
        })
    }
  });
});

// 删除用户
app.post('/users/del', function(req, res) {
  // 删除记录
  var id = req.body.id
  if (!id) {
    res.json({ status: 401, message: '删除失败,id不存在！' })
    return
  }
  User.findById(id, function(err, data) {
    User.remove(data, function(error){
      if(error) {
        console.log(error);
        res.json({ status: 401, message: '删除失败' })
      } else {
        console.log('delete ok!');
        res.json({ status: 200, message: '删除成功' })
      }
    });
  })
});

// 评价课程
app.post('/course/evaluate',async function(req, res) {
  const course = req.body.course
  const level = req.body.level
  const sub = req.body.sub
  const student = req.body.user._id
  if (!course || !level || !sub || !student) {
    res.json({ success: false, message: '参数缺失！' })
    return
  }
  try {
    const evaluates = await Evaluate.find({course, student})
    if (evaluates.length !== 0) {
      res.json({ success: false, message: '您已经评价过当前课程了！' })
      return
    }
    const data = await Evaluate.create({course, level, sub, student})
    res.json({ success: true, message: '添加评价记录成功！' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: '添加评价记录失败！' })
  }
});

// 导入督导组评价
app.post('/course/exportevaluate',async function(req, res) {
  try {
    await ExportEvaluate.create(req.body.list)
    await res.json({
      success: true,
      message: '添加督导组评课记录成功！'
    })
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      message: '添加督导组评课记录失败！'
    })
  }
});

// 管理员查询课程成绩
app.post('/course/getGradeByAdmin',async function(req, res) {
  const id = req.body.id
  try {
    const data = await Evaluate.find({course: id})
    console.log('查询成绩')
    console.log(data)
    res.json({
        success: true,
        message: '查询成功！',
        data: data
    });
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: '服务异常' });
  }
});

// 管理员查询督导组数据
app.post('/course/getGradeByAdminExport',async function(req, res) {
  const id = req.body.id
  try {
    const data = await ExportEvaluate.find({course: id})
    console.log('查询成绩')
    console.log(data)
    res.json({
        success: true,
        message: '查询成功！',
        data: data
    });
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: '服务异常' });
  }
});

// 评价课程
app.post('/teacher/getgrade', async function(req, res) {
  console.log(req.body)
  const teacher = req.body.id
  const courses = await Course.find({teacher})
  console.log(courses)
  // courses.map(i => {
  //   const evaluates = await Evaluate.find({ course: i._id })
  //   console.log('查询到评课记录')
  //   console.log(evaluates)
  // })
  // Course.find({teacher}).then(data => {
  //   data.map(i => {
  //     Evaluate.find({ course: i._id }).then(temp => {
  //       console.log('查询到评课记录')
  //       console.log(temp)
  //     })
  //   })
  // })
});

app.use('/course/achievement', async function(req, res) {
  try {
    const user = req.body.user
    console.log('当前用户：')
    console.log(user)
    const courses = await Course.find({teacher: user._id})
    console.log(courses)
    const data = await Promise.all(courses.map((course, index) => {
        return Evaluate.find({course: course._id})
    }))
    console.log('查询成绩')
    console.log(data)
    const temp = courses.map((i,index) => {
      return {
        ...i._doc,
        achievement: data[index]
      }
    })
    console.log('最终成绩')
    console.log(temp)

    res.json({
        success: true,
        message: '查询成功！',
        data: temp
    });
    // const user = await User.findOne({username: req.body.username})
    // if (!user) {
    //   res.json({ success: false, message: '认证失败，用户名找不到' });
    // } else if (user.password !== req.body.password) {
    //   res.json({ success: false, message: '认证失败，密码错误' });
    // } else {
    //   console.log(user)
    //   var token = jwt.sign(user, 'shhhhh');
    //   res.json({
    //       success: true,
    //       message: '登录成功！',
    //       user,
    //       token
    //   });
    // }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: '服务异常' });
  }
});

app.use('/users/getTeacherList', async function(req, res) {
  try {
    const users = await User.find({type: 'teacher'})
    console.log(users)
    res.json({
        success: true,
        message: '查询成功！',
        data: users
    });

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: '服务异常' });
  }
});

app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
