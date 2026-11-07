  (func (;43583;) (type 8) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i64 f32 f32 f32)
    global.get 0
    i32.const 80
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366845
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356080
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420048
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3420172
      call 2180
      i32.const 3429560
      call 2180
      i32.const 3369344
      call 2180
      i32.const 3434324
      call 2180
      i32.const 4366845
      i32.const 1
      i32.store8
    end
    i32.const 3369344
    i32.load
    call 1900
    local.tee 5
    local.get 2
    i32.store offset=12
    local.get 1
    i32.const 0
    i32.store
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=84
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=85
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=52
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=44
      local.set 2
      i32.const 3360788
      i32.load
      local.tee 6
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 6
        call 60460
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      i32.load offset=56
      i32.store
      local.get 5
      local.get 0
      i32.load offset=44
      local.tee 4
      i32.store offset=8
      local.get 3
      i32.const -64
      i32.sub
      local.get 4
      i32.const 0
      call 48828
      local.tee 4
      i32.const 0
      call 49493
      local.get 3
      f32.load offset=72
      local.set 8
      local.get 3
      f32.load offset=68
      local.set 9
      local.get 3
      f32.load offset=64
      local.set 10
      local.get 0
      i32.const 0
      i32.store offset=44
      i32.const 3434324
      i32.load
      local.set 1
      local.get 0
      i32.const 0
      i32.store8 offset=85
      local.get 0
      i32.const 0
      i32.store offset=40
      local.get 0
      local.get 1
      i32.store offset=88
      local.get 0
      i32.const 0
      i32.store offset=56
      local.get 0
      i32.const 0
      i32.store8 offset=52
      local.get 5
      local.get 0
      local.get 0
      call 43542
      i32.store offset=16
      local.get 4
      i32.const 0
      i32.const 0
      call 7821
      drop
      i32.const 3356080
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      i32.const 0
      call 7600
      local.set 0
      local.get 3
      i32.const 56
      i32.add
      local.tee 1
      local.get 8
      f32.const 0x1.2e147ap+0 (;=1.18;)
      f32.mul
      f32.store
      local.get 3
      local.get 1
      i32.load
      i32.store offset=24
      local.get 3
      local.get 9
      f32.const 0x1.2e147ap+0 (;=1.18;)
      f32.mul
      f32.store offset=52
      local.get 3
      local.get 10
      f32.const 0x1.2e147ap+0 (;=1.18;)
      f32.mul
      f32.store offset=48
      local.get 3
      local.get 3
      i64.load offset=48
      i64.store offset=16
      local.get 0
      local.get 4
      local.get 3
      i32.const 16
      i32.add
      f32.const 0x1.47ae14p-4 (;=0.08;)
      i32.const 0
      call 7781
      i32.const 6
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
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
      local.set 7
      local.get 3
      local.get 1
      i32.load offset=8
      local.tee 1
      i32.store offset=8
      local.get 3
      local.get 1
      i32.store offset=40
      local.get 3
      local.get 7
      i64.store offset=32
      local.get 3
      local.get 7
      i64.store
      local.get 0
      local.get 4
      local.get 3
      f32.const 0x1.70a3d8p-3 (;=0.18;)
      i32.const 0
      call 7781
      i32.const 26
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
      i32.const 3364124
      i32.load
      call 1900
      local.tee 4
      local.get 5
      i32.const 3429560
      i32.load
      i32.const 0
      call 7547
      local.get 0
      local.get 4
      i32.const 3420048
      i32.load
      call 14773
      drop
      local.get 0
      local.get 5
      i32.load offset=8
      i32.const 6
      i32.const 3420172
      i32.load
      call 14799
      drop
      i32.const 1
      local.set 4
    end
    local.get 3
    i32.const 80
    i32.add
    global.set 0
    local.get 4)
