  (func (;44439;) (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 f32 f32 f32 f32)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4367449
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375596
      call 2180
      i32.const 3375616
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367449
      i32.const 1
      i32.store8
    end
    i32.const 3360788
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48872
    local.set 4
    block  ;; label = @1
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 4
      br_if 0 (;@1;)
      local.get 0
      local.get 1
      local.get 2
      local.get 3
      call 44397
      local.get 2
      i32.const 3
      i32.eq
      if  ;; label = @2
        local.get 1
        i32.const 0
        call 48736
        i32.const 1
        i32.const 0
        call 48833
      end
      i32.const 3375616
      i32.load
      local.set 2
      local.get 0
      i32.load offset=28
      local.set 4
      local.get 3
      i32.const 0
      i32.store offset=44
      local.get 4
      local.get 3
      i32.const 44
      i32.add
      local.get 3
      i32.const 40
      i32.add
      local.get 2
      call 34434
      local.get 3
      f32.load offset=40
      local.set 7
      local.get 1
      f32.load offset=104
      local.set 8
      i32.const 3375596
      i32.load
      local.set 2
      local.get 0
      i32.load offset=24
      local.set 4
      local.get 3
      i32.const 0
      i32.store offset=44
      local.get 4
      local.get 3
      i32.const 44
      i32.add
      local.get 3
      i32.const 40
      i32.add
      local.get 2
      call 34434
      local.get 7
      local.get 8
      f32.mul
      local.set 7
      local.get 1
      i32.load offset=100
      local.get 3
      i32.load offset=40
      i32.add
      local.set 4
      local.get 1
      i32.const 0
      call 48735
      local.set 5
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 2
      f32.load offset=12
      local.set 9
      local.get 2
      f32.load offset=16
      local.set 10
      local.get 3
      i32.const 32
      i32.add
      local.tee 6
      local.get 7
      local.get 2
      f32.load offset=20
      f32.mul
      local.get 1
      f32.load offset=76
      local.tee 8
      f32.mul
      f32.store
      local.get 3
      local.get 6
      i32.load
      i32.store offset=16
      local.get 3
      local.get 8
      local.get 7
      local.get 10
      f32.mul
      f32.mul
      f32.store offset=28
      local.get 3
      local.get 8
      local.get 7
      local.get 9
      f32.mul
      f32.mul
      f32.store offset=24
      local.get 3
      local.get 3
      i64.load offset=24
      i64.store offset=8
      local.get 5
      local.get 3
      i32.const 8
      i32.add
      i32.const 0
      call 49495
      local.get 1
      i32.const 0
      local.get 4
      local.get 3
      call 44358
      local.get 1
      i32.const 0
      i32.store8 offset=108
      local.get 1
      i32.const 0
      call 49305
      f32.const 0x0p+0 (;=0;)
      f32.add
      f32.store offset=112
      i32.const 4367385
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360788
        call 2180
        i32.const 4367385
        i32.const 1
        i32.store8
      end
      local.get 1
      i32.load offset=44
      local.set 2
      i32.const 3360788
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 48812
      if  ;; label = @2
        local.get 1
        i32.load offset=44
        i32.const 1
        i32.const 0
        call 48707
      end
      local.get 0
      local.get 1
      local.get 3
      call 44368
    end
    local.get 3
    i32.const 48
    i32.add
    global.set 0)
