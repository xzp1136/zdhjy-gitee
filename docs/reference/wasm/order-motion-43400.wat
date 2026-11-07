  (func (;43400;) (type 26) (param i32 i32 f32 i32)
    (local i32 i32 i32)
    i32.const 4366744
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3355160
      call 2180
      i32.const 3356428
      call 2180
      i32.const 3385820
      call 2180
      i32.const 3385824
      call 2180
      i32.const 3387216
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3351252
      call 2180
      i32.const 3413780
      call 2180
      i32.const 3353920
      call 2180
      i32.const 3435328
      call 2180
      i32.const 3435456
      call 2180
      i32.const 3471320
      call 2180
      i32.const 4366744
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.const 0
    i32.store offset=100
    local.get 0
    i32.const 0
    i32.store offset=92
    local.get 0
    i32.const 0
    i32.store8 offset=76
    local.get 0
    i32.const 0
    i32.store8 offset=130
    local.get 0
    i32.const 256
    i32.store16 offset=128
    local.get 0
    local.get 1
    i32.load8_u offset=17
    i32.store8 offset=78
    local.get 0
    local.get 1
    i32.load8_u offset=16
    i32.store8 offset=104
    local.get 0
    local.get 1
    i32.load offset=8
    i32.store offset=108
    local.get 0
    local.get 1
    i32.load offset=12
    i32.load offset=8
    i32.store offset=116
    local.get 0
    local.get 1
    i32.load8_u offset=18
    i32.store8 offset=79
    i32.const 3353920
    i32.load
    i32.const 6
    call 2185
    local.tee 3
    i32.const 3435328
    i32.load
    i32.store offset=16
    local.get 0
    i32.const 79
    i32.add
    local.set 4
    local.get 0
    i32.const 108
    i32.add
    local.set 5
    i32.const 3355160
    i32.load
    local.tee 6
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 6
      call 60460
    end
    local.get 3
    local.get 0
    i32.const 104
    i32.add
    i32.const 0
    call 38085
    i32.store offset=20
    local.get 3
    i32.const 3435456
    i32.load
    i32.store offset=24
    local.get 3
    local.get 5
    i32.const 0
    call 53141
    i32.store offset=28
    local.get 3
    i32.const 3471320
    i32.load
    i32.store offset=32
    local.get 3
    local.get 4
    i32.const 0
    call 38085
    i32.store offset=36
    local.get 3
    i32.const 0
    call 48226
    local.set 3
    i32.const 3356428
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    local.get 3
    i32.const 0
    call 55817
    local.get 0
    local.get 1
    i32.load offset=12
    local.get 0
    call 43402
    local.get 0
    i32.load offset=84
    i32.load offset=12
    local.tee 3
    i32.const 0
    i32.le_s
    if  ;; label = @1
      local.get 0
      i32.const 0
      i32.store8 offset=129
      return
    end
    local.get 0
    local.get 3
    i32.store offset=112
    i32.const 3385824
    i32.load
    local.set 4
    local.get 0
    i32.load offset=56
    local.tee 3
    local.get 3
    i32.load offset=16
    i32.const 1
    i32.add
    i32.store offset=16
    block  ;; label = @1
      local.get 4
      i32.load offset=16
      i32.load offset=96
      i32.load offset=100
      call 2224
      if  ;; label = @2
        local.get 3
        i32.load offset=12
        local.set 4
        local.get 3
        i32.const 0
        i32.store offset=12
        local.get 4
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 3
        i32.load offset=8
        i32.const 0
        local.get 4
        i32.const 0
        call 54070
        br 1 (;@1;)
      end
      local.get 3
      i32.const 0
      i32.store offset=12
    end
    local.get 0
    i32.load offset=84
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      i32.const 0
      local.set 3
      loop  ;; label = @2
        local.get 0
        i32.load offset=56
        local.set 4
        i32.const 3351252
        i32.load
        call 1900
        local.tee 5
        i32.const 3387216
        i32.load
        call 35169
        local.get 4
        local.get 5
        i32.const 3385820
        i32.load
        call 50463
        local.get 3
        i32.const 1
        i32.add
        local.tee 3
        local.get 0
        i32.load offset=84
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 1
    i32.load offset=12
    local.set 3
    i32.const 3354340
    i32.load
    call 1900
    local.tee 4
    local.get 0
    i32.const 3413780
    i32.load
    i32.const 0
    call 38015
    local.get 0
    local.get 3
    local.get 2
    local.get 4
    local.get 0
    call 43403
    local.get 0
    local.get 0
    call 43404)
