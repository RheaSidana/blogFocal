//VARIABLE FOR CONNECTING WITH MYSQL    
var mysql = require('mysql');

//creating connection
var con = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword"
});

//connecting with mysql
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    con.query("CREATE DATABASE maappdb", function (err, result) {
        if (err) throw err;
        console.log("Database created");
    });

    var sql = "CREATE TABLE user (name VARCHAR(255), address VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });

    var sqlpost = "CREATE TABLE posts (name VARCHAR(255), address VARCHAR(255))";
    con.query(sqlpost, function (err, result) {
       if (err) throw err;
        console.log("Table created");
    });
});

//creating the app
var app = angular.module('myApp', ['ui.router', ' ngToast',  'textangular']);

//authenticating the app
app.factory('Authservice', function($q, $rootScope ){
    return {
        isauthenticated:function(){
            var defer = $q.defer();
            $rootScope.user.currentUser( function (err, res){
                if(err){
                    defer.resolve (false);
                    $rootScope.LoggedIn= false;
                }
                if(res.user){
                    defer.resolve(true);
                    $rootScope.LoogedIn = true;
                }
                else{
                    defer.resolve(false);
                    $rootScope.LoggedIn = false;
                }
            });
            return defer.promise;
        }
    }
});

//applying filter 
app.filter ('htmlToPlainText', function(){
    return function(text){
        return text ? String (text). replace(/[^>]+/gm,'') : '' ;
    }
})

//configuring routing of the app
app.config ( function ( $stateProvider, $urlRouterProvider){
    $stateProvider
    .state('home',{
        url:'/',
        templateurl:'homepage.html',
        controller:'HomeCtrl'
    })
    .state('login',{
        url:'/login',
        templateurl:'login.html',
        controller:'loginCtrl'
    })
    .state('signup',{
        url:'/signup',
        templateurl:'signup.html',
        controller:'SignupCtrl'
    })
    .state('userpage',{
        url:'/userpage',
        templateurl:'userpage.html',
        controller:'UserpageCtrl'
    })
    .state('history',{
        url:'/history',
        templateurl:'history.html',
        controller:'HistoryCtrl'
    })
    .state('editPref',{
        url:'/Preferences',
        templateurl:'editpref.html',
        controller:'PreferenceCtrl'
    })
    .state('create',{
        url:'/createPost',
        templateurl:'createPost.html',
        controller:'createCtrl'
    })
    .state('historyPost',{
        url:'/historyPosts',
        templateurl:'historyPost.html',
        controller:'HistoryPostCtrl'
    })
    $urlRouterProvider.otherwise("/");
});

//controller for home control
app.controller('HomeCtrl', function ($rootScope, $timeout, $state){
    $scope.logout=function(){
        console.log ("logoutcalled");        
    }
    $scope.querysend=function(){
        //send email to digimania@helpdesk.com from query.email
    }
});

//controller for signup control
app.controller('SignupCtrl', function($scope,ngToast,$rootScope){
    $rootScope.newUser={};
    $rootScope.LoggedIn = false;
    $rootScope.SignUp=function(){
        if($rootScope.newUser.fname && $rootScope.newUser.lname && $rootScope.newUser.email && $rootScope.newUser.password && $rootScope.newUser.confirmPassword )
        {
            console.log(" All fields are valid !! ");
            if ($rootScope.newUSer.password == $rootScope.newUSer.confirmPassword)
            {
                console.log(" All Good!!!!  Lets Sign Up !! ");
                ngToast.create("All good. Lets continue");
                $rootScope.LoggedIn = true;
            }
            else{
                console.log("Password donot match");
                ngToast.create("Password do not match,  please enter the correct Password ");
            }
        }
        else{
            console.log("Fields invalid");
                ngToast.create(" Some fields are invalid or missing. Please enter a valid field ! ");
        }
        $timeout( function (){
            $state.go("userpage");
        });

    };
    $scope.newUser.displayName= $scope.newUser.fname + " " + $scope.newUser.lname;

});

//controller for login control
app.controller ('LoginCtrl', function($scope, $location, $timeout,$rootScope,ngToast){
    $rootScope.user={};
    $scope.login = function(){
        $rootScope.user.currentUser()
        .then(function(res){
            console.log(res);
            if (res.User){
                $rootScope.LoggedIn = true;
                $rootScope.displayName = res.user.fname+ " " + res.user.lname;
                $timeout (function(){
                    $location.path("/userpage");
                    ngToast.create("user can now access the account");
                });
            }
            else{
                $rootScope.user.login($scope.user)
                .then(function(res)
                {
                    console.log(res);
                    $rootScope.LoggedIn=true;
                    $rootScope.displayName=res.fName + " "+ res.lname;

                    $timeout(function(){
                        $state.go("userpage");
                        ngToast.create("user can now create the post");
                    });
                },
                function (error){
                    console.log(error);
                    $rootScope.LoggedIn = false;

                    $timeout(function(){
                        ngToast("error has occured");
                    });
                });
            }
        });
    };
});

////controller for userpage control
app.controller('UserpageCtrl', function ($scope, $timeout,ngToast, $state){
    $scope.createPost=function(){
        $scope.user.currentUser()
        .then (function(res){
            if(res.user)
            {
                $timeout(function(){
                    ngToast.create("creating post") ;    
                })
                $state.go("create");
            }
            else{
                $timeout(function(){
                    ngToast.create("error occured!! Login First.");    
                })
                $state.go("login");
            }
        }),
        function(err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        };
    };
    $scope.history = function(){
        $scope.user.currentUser()
        .then (function(res){
            if(res.user)
            {
                $timeout(function(){
                    ngToast.create("checking History") ;    
                })
                $state.go("history");
            }
            else{
                $timeout(function(){
                    ngToast.create("error occured!! Login First.");    
                })
                $state.go("login");
            }
        }),
        function(err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        };
    };
    $scope.editPrefer = function(){
        $scope.user.currentUser()
        .then (function(res){
            if(res.user)
            {
                $timeout(function(){
                    ngToast.create("edit your preferences") ;    
                })
                $state.go("editPref");
            }
            else{
                $timeout(function(){
                    ngToast.create("error occured!! Login First.");    
                })
                $state.go("login");
            }
        }),
        function(err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        };
    }; 
});

////controller for history control, RETRIEVING DATA
app.controller('HistoryCtrl', function ($rootScope, $timeout,ngToast, $state){
    $rootScope.historyNo = function(){
        $scope.user.currentUser()
        .then (function(res){
            if(res.user){
                if($rootScope.historyCount >5){
                    //delete the first post
                }
                //view summary list of the the posts
            }
            else{
                $timeout(function(){
                    ngToast.create("An error occured!! login first.");
                });
                $state.go("login");
            }            
        }),
        function(err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        }
    };
});

//controller for preference selecting control 
app.controller('PreferenceCtrl', function ($scope, $timeout,ngToast, $state){
    $scope.choice=function(){
        $scope.user.currentUser()
        .then(function(res){
            if(res.user){
                
                if(post.FACEBOOK == checked)
                {
                    $scope.postonFB(); //function calling
                    $scope.$apply();
                }
                if(post.TWITTER == checked)
                {
                    $scope.postonTWEET();
                    $scope.$apply();
                }
                if(post.LINKEDIN == checked)
                {
                    $scope.postonLINKEDIN();
                    $scope.$apply();
                }
                if(post.PINTEREST == checked)
                {
                    $scope.postonPINS();
                    $scope.$apply();
                }

                else
                {
                    $timeout(function(){
                        ngToast.create("no preference selected");
                    })
                }
            }
            else{
                $timeout(function(){
                    ngToast.create("error occured!! Login First.");    
                })
                $state.go("login");
            }
        }),
        function(err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        }
    };

    $scope.postonFB=function(){

    };
    $scope.postonTWEET=function(){
        
    };
    $scope.postonLINKEDIN=function(){
        
    };
    $scope.postonPINS=function(){
        
    };
});

//controller for create post control, POST DATA
app.controller('createCtrl', function ($rootScope, $timeout,ngToast, $state){
    $scope.newPost={};
    $rootScope.historyCount=0;
    $scope.create=function(){
        $scope.user.currentUser()
        .then(function(res){
            if(res.user){
                //save data to database
                ngToast.create("Post Successful");
                $state.go("userpage");
                $rootScope.historyCount += 1;
                $scope.$apply();
            }
            else{
                ngToast.create("error occured!! Login First.");
                $state.go("login");
            }
        }),
        function(err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        }
    }
});

//controller for historypost control, RETRIEVING DATA
app.controller('HistoryPostCtrl', function ($rootScope,ngToast, $timeout, $state){
    //display image from  the database 
    
});