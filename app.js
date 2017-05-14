var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var Course = require('./modals/Course.js')
var Users = require('./modals/User.js')
var Selection = require('./modals/StudentCourseSelection.js')
var Evaluate = require('./modals/Evaluate.js')


const deepCopy = (p, c) => {　　
    var c = c || {};　　　　
    for (var i in p) {　　　　　　
        if (typeof p[i] === 'object') {　　　　　　　　
            c[i] = (p[i].constructor === Array) ? [] : {};　　　　　　　　
            deepCopy(p[i], c[i]);　　　　　　
        } else {　　　　　　　　　
            c[i] = p[i];　　　　　　
        }　　　　
    }　　　　
    return c;　　
}

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/CourseManagementSystem')
mongoose.set('debug', true);

// 增加记录 基于model操作
// var doc = {
//   name : '计算机网络原理',
//   desc : '计算机网络原理基础（一）'
// };
// Course.create(doc, function(error){
//     if(error) {
//         console.log(error);
//     } else {
//         console.log('save ok');
//     }
//     // 关闭数据库链接
//     // db.close();
// });

// Course.fetch((err, Courses) => {
//   if (err) { console.log(err) }
//   console.log('Courses')
//   console.log(Courses)
// })
// console.log(Course)

var index = require('./routes/index');
var users = require('./routes/users');

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

// 获取课程列表
app.use('/course/list', function(req, res) {
  Course.fetch((err, courses) => {
    if (err) { console.log(err) }
    Selection.find({'student': '590ed3ef8b411c0f548be2f3'}).then((selections) => {
      for(let i = 0; i < selections.length; i ++ ) {
        for(let j = 0; j < courses.length; j ++ ) {
          if (selections[i].course.toString() === courses[j]._id.toString()) {
            courses[j].select = true
          }
        }
      }
      res.json({
        status: 200,
        courses
      });
    })
  })
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

// 选课
app.post('/course/select', function(req, res) {

  var course = req.body.course
  var student = req.body.student
  if (!student || !course) {
    res.json({ status: 401, message: '参数错误！' })
    return
  }

  Selection.findOne(req.body).then(selection => {
    console.log(selection)
    if (!selection) {
      Selection.create(req.body, function(err){
        if(err) {
            console.log(err);
            res.json({
              status: 401,
              message: '选课失败！'
            })
        } else {
            console.log('save ok');
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
app.use('/users/list', function(req, res) {
  Users.fetch((err, users) => {
    if (err) { console.log(err) }
    res.json({
      status: 200,
      users
    });
  })
});

// 添加用户
app.post('/users/add', function(req, res) {
  Users.create(req.body, function(err){
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
app.delete('/users/del', function(req, res) {
  // 删除记录
  var id = req.body.id
  if (!id) {
    res.json({ status: 401, message: '删除失败,id不存在！' })
    return
  }
  Users.findById(id, function(err, data) {
    Users.remove(data, function(error){
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
app.post('/course/evaluate', function(req, res) {
  console.log(req.body)
  Evaluate.create(req.body, function(err){
    if(err) {
        console.log(err);
        res.json({
          status: 401,
          message: '添加评价记录失败！'
        })
    } else {
        console.log('save ok');
        res.json({
          status: 200,
          message: '添加评价记录成功！'
        })
    }
  });
});

// 评价课程
app.post('/teacher/getgrade', function(req, res) {
  console.log(req.body)
  const teacher = req.body.id
  Course.find({teacher}).then(data => {
    data.map(i => {
      Evaluate.find({ course: i._id }).then(temp => {
        console.log('查询到评课记录')
        console.log(temp)
      })
    })
  })
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
