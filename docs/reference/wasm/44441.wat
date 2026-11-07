  (func (;44441;) (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 i64)
    global.get 0
    i32.const 160
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4367451
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375616
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420044
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3420168
      call 2180
      i32.const 3428288
      call 2180
      i32.const 3367764
      call 2180
      i32.const 4367451
      i32.const 1
      i32.store8
    end
    i32.const 3367764
    i32.load
    call 1900
    local.tee 4
    local.get 0
    i32.store offset=12
    local.get 4
    local.get 1
    i32.store offset=8
    i32.const 3360788
    i32.load
    local.tee 5
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 5
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48872
    i32.eqz
    if  ;; label = @1
      local.get 4
      i32.load offset=8
      i32.const 0
      call 48735
      local.set 6
      i32.const 3375616
      i32.load
      local.set 1
      local.get 0
      i32.load offset=28
      local.set 5
      local.get 3
      local.get 4
      i32.load offset=8
      i32.load offset=72
      i32.store offset=96
      local.get 5
      local.get 3
      i32.const 96
      i32.add
      local.get 3
      i32.const 144
      i32.add
      local.get 1
      call 34434
      local.get 3
      f32.load offset=144
      local.get 4
      i32.load offset=8
      local.tee 5
      f32.load offset=104
      f32.mul
      local.set 7
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
        local.get 4
        i32.load offset=8
        local.set 5
      end
      local.get 2
      f32.load offset=8
      local.set 8
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 1
      f32.load offset=12
      local.set 13
      local.get 1
      f32.load offset=16
      local.set 9
      local.get 5
      f32.load offset=76
      local.set 10
      local.get 1
      f32.load offset=20
      local.set 14
      local.get 2
      f32.load
      local.set 15
      local.get 2
      f32.load offset=4
      local.set 16
      local.get 0
      f32.load offset=228
      local.tee 11
      f32.neg
      local.get 11
      i32.const 0
      call 48613
      local.set 11
      local.get 0
      f32.load offset=232
      local.tee 12
      f32.neg
      local.get 12
      i32.const 0
      call 48613
      local.set 12
      local.get 4
      i32.load offset=8
      i32.const 0
      call 48735
      local.set 0
      local.get 3
      i32.const 136
      i32.add
      local.tee 1
      local.get 8
      f32.const 0x0p+0 (;=0;)
      f32.add
      f32.store
      local.get 3
      local.get 1
      i32.load
      i32.store offset=72
      local.get 3
      local.get 16
      local.get 12
      f32.add
      f32.store offset=132
      local.get 3
      local.get 15
      local.get 11
      f32.add
      f32.store offset=128
      local.get 3
      local.get 3
      i64.load offset=128
      i64.store offset=64
      local.get 0
      local.get 3
      i32.const -64
      i32.sub
      i32.const 0
      call 49470
      local.get 10
      local.get 7
      local.get 14
      f32.mul
      f32.mul
      local.set 8
      local.get 10
      local.get 7
      local.get 9
      f32.mul
      f32.mul
      local.set 9
      local.get 10
      local.get 7
      local.get 13
      f32.mul
      f32.mul
      local.set 7
      local.get 4
      i32.load offset=8
      i32.const 0
      call 48735
      local.set 0
      i32.const 4377527
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377527
        i32.const 1
        i32.store8
      end
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 1
      i64.load align=4
      local.set 17
      local.get 3
      local.get 1
      i32.load offset=8
      local.tee 1
      i32.store offset=56
      local.get 3
      local.get 1
      i32.store offset=120
      local.get 3
      local.get 17
      i64.store offset=112
      local.get 3
      local.get 17
      i64.store offset=48
      local.get 0
      local.get 3
      i32.const 48
      i32.add
      i32.const 0
      call 49495
      local.get 4
      i32.load offset=8
      i32.const 0
      call 48735
      local.set 0
      local.get 3
      i32.const 152
      i32.add
      local.tee 1
      f32.const -0x1.68p+7 (;=-180;)
      f32.const 0x1.68p+7 (;=180;)
      i32.const 0
      call 48613
      f32.const 0x1.1df46ap-6 (;=0.0174533;)
      f32.mul
      f32.store
      local.get 3
      local.get 1
      i32.load
      i32.store offset=40
      local.get 3
      i64.const 0
      i64.store offset=32
      local.get 3
      i64.const 0
      i64.store offset=144
      local.get 3
      i32.const 96
      i32.add
      local.get 3
      i32.const 32
      i32.add
      i32.const 0
      call 28095
      local.get 3
      local.get 3
      i64.load offset=104
      i64.store offset=24
      local.get 3
      local.get 3
      i64.load offset=96
      i64.store offset=16
      local.get 0
      local.get 3
      i32.const 16
      i32.add
      i32.const 0
      call 49478
      local.get 3
      i32.const 88
      i32.add
      local.tee 0
      local.get 8
      f32.store
      local.get 3
      local.get 0
      i32.load
      i32.store offset=8
      local.get 3
      local.get 9
      f32.store offset=84
      local.get 3
      local.get 7
      f32.store offset=80
      local.get 3
      local.get 3
      i64.load offset=80
      i64.store
      local.get 6
      local.get 3
      f32.const 0x1.666666p-2 (;=0.35;)
      i32.const 0
      call 7781
      i32.const 9
      i32.const 3420152
      i32.load
      call 14789
      local.get 4
      i32.load offset=8
      i32.const 0
      call 48736
      i32.const 6
      i32.const 3420168
      i32.load
      call 14799
      local.set 0
      i32.const 3364124
      i32.load
      call 1900
      local.tee 1
      local.get 4
      i32.const 3428288
      i32.load
      i32.const 0
      call 7547
      local.get 0
      local.get 1
      i32.const 3420044
      i32.load
      call 14773
      drop
    end
    local.get 3
    i32.const 160
    i32.add
    global.set 0)
