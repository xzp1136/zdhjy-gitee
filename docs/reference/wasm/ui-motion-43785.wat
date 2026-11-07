  (func (;43785;) (type 2) (param i32 i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366989
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420044
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3426788
      call 2180
      i32.const 3426792
      call 2180
      i32.const 3366540
      call 2180
      i32.const 4366989
      i32.const 1
      i32.store8
    end
    i32.const 3366540
    i32.load
    call 1900
    local.tee 2
    local.get 1
    i32.store offset=12
    local.get 2
    local.get 0
    i32.store offset=8
    local.get 0
    i32.const 0
    call 48735
    local.set 1
    local.get 3
    local.get 0
    i32.load offset=52
    i32.store offset=8
    local.get 3
    local.get 0
    i64.load offset=44 align=4
    i64.store
    local.get 1
    local.get 3
    f32.const 0x1.99999ap-4 (;=0.1;)
    i32.const 0
    call 7781
    i32.const 7
    i32.const 3420152
    i32.load
    call 14789
    local.set 1
    i32.const 3364124
    i32.load
    call 1900
    local.tee 4
    local.get 2
    i32.const 3426788
    i32.load
    i32.const 0
    call 7547
    local.get 1
    local.get 4
    i32.const 3420044
    i32.load
    call 14773
    drop
    local.get 0
    i32.const 0
    i32.store offset=80
    local.get 0
    i32.const 0
    i32.store8 offset=84
    local.get 0
    i32.const 0
    i32.store8 offset=40
    i32.const 3354340
    i32.load
    call 1900
    local.tee 1
    local.get 2
    i32.const 3426792
    i32.load
    i32.const 0
    call 38015
    i32.const 4366990
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3366544
      call 2180
      i32.const 4366990
      i32.const 1
      i32.store8
    end
    i32.const 3366544
    i32.load
    call 1900
    local.tee 2
    local.get 1
    i32.store offset=16
    local.get 2
    i32.const 0
    i32.store offset=8
    local.get 0
    local.get 2
    i32.const 0
    call 48887
    drop
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
